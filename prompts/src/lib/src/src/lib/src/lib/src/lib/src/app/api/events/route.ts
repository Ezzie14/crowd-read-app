import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAuthorizedAutomation } from '@/lib/auth';

// POST: create a new event (called by n8n)
export async function POST(req: NextRequest) {
  if (!isAuthorizedAutomation(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { sport, name, question, question_options, market_start_price, locks_at } = body;

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert([{ sport, name, question, question_options, market_start_price, locks_at }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// GET: fetch the current open event for the home screen (public)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('reveal_generated', false)
    .gt('locks_at', new Date().toISOString())
    .order('locks_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
