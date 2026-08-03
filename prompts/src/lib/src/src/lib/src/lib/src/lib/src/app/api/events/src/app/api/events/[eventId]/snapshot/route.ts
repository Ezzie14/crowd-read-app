import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAuthorizedAutomation } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  if (!isAuthorizedAutomation(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { price } = await req.json();

  const { error } = await supabaseAdmin
    .from('odds_snapshots')
    .insert([{ event_id: params.eventId, price }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
