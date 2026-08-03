import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAuthorizedAutomation } from '@/lib/auth';
import { generateRevealScript } from '@/lib/llm';
import { generateAndStoreAudio } from '@/lib/tts';

// POST: triggered by n8n once the market outcome is known
export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  if (!isAuthorizedAutomation(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eventId = params.eventId;
  const { outcome_option, market_close_price } = await req.json();

  const { data: event, error: eventErr } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  if (eventErr || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  if (event.reveal_generated) {
    return NextResponse.json({ error: 'Reveal already generated for this event' }, { status: 400 });
  }

  const { data: predictions, error: predErr } = await supabaseAdmin
    .from('predictions')
    .select('choice')
    .eq('event_id', eventId);
  if (predErr) return NextResponse.json({ error: predErr.message }, { status: 500 });

  const total = predictions?.length ?? 0;
  const breakdown: Record<string, number> = {};
  for (const opt of event.question_options as string[]) {
    const count = predictions!.filter((p) => p.choice === opt).length;
    breakdown[opt] = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
  }
  const crowdAccuracy = total > 0 ? breakdown[outcome_option] || 0 : 0;

  await supabaseAdmin
    .from('events')
    .update({ market_close_price, outcome_option, reveal_generated: true })
    .eq('id', eventId);

  const script = await generateRevealScript({
    event_name: event.name,
    question: event.question,
    options: event.question_options,
    outcome_option,
    crowd_accuracy_pct: crowdAccuracy,
    crowd_breakdown: breakdown
  });

  const audioUrl = await generateAndStoreAudio(script, eventId);

  const { data: reveal, error: revealErr } = await supabaseAdmin
    .from('reveals')
    .insert([{
      event_id: eventId,
      script_text: script,
      audio_url: audioUrl,
      crowd_accuracy_pct: crowdAccuracy
    }])
    .select()
    .single();

  if (revealErr) return NextResponse.json({ error: revealErr.message }, { status: 500 });
  return NextResponse.json(reveal);
}

// GET: public — fetch the reveal for a given event, once it exists
export async function GET(_req: NextRequest, { params }: { params: { eventId: string } }) {
  const { data, error } = await supabaseAdmin
    .from('reveals')
    .select('*')
    .eq('event_id', params.eventId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
