import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST: lock in a user's prediction. Public route — user_id comes from
// your auth session (wire up Supabase Auth or your chosen auth provider
// and read the verified user id server-side rather than trusting the body).
export async function POST(req: NextRequest) {
  const { event_id, user_id, squad_id, choice } = await req.json();

  const { data: event, error: eventErr } = await supabaseAdmin
    .from('events')
    .select('locks_at, question_options')
    .eq('id', event_id)
    .single();

  if (eventErr || !event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (new Date() >= new Date(event.locks_at)) {
    return NextResponse.json({ error: 'Predictions are locked for this event' }, { status: 400 });
  }
  if (!(event.question_options as string[]).includes(choice)) {
    return NextResponse.json({ error: 'Invalid choice for this event' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('predictions')
    .upsert([{ event_id, user_id, squad_id, choice }], { onConflict: 'event_id,user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
