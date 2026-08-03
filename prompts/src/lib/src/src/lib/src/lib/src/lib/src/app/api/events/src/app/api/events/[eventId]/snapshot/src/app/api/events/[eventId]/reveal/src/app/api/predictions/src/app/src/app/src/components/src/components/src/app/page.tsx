'use client';

import { useEffect, useState } from 'react';
import { BoardHeader } from '@/components/BoardHeader';

interface Event {
  id: string;
  sport: string;
  name: string;
  question: string;
  question_options: string[];
  locks_at: string;
}

export default function HomePage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvent(data))
      .finally(() => setLoading(false));
  }, []);

  async function lockChoice(choice: string) {
    if (!event || submitting) return;
    setSubmitting(true);

    // In production, user_id comes from your real auth session —
    // this placeholder keeps the demo runnable before auth is wired up.
    const userId = localStorage.getItem('crowdread_user_id') ?? crypto.randomUUID();
    localStorage.setItem('crowdread_user_id', userId);

    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: event.id, user_id: userId, choice })
    });

    if (res.ok) setLocked(choice);
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-paper">
      <BoardHeader />

      <div className="max-w-md mx-auto px-5 py-10">
        {loading && (
          <p className="font-body text-ink/60 text-center py-20">
            Chalking up today&apos;s board&hellip;
          </p>
        )}

        {!loading && !event && (
          <div className="text-center py-20">
            <p className="font-display text-xl uppercase tracking-board text-green mb-2">
              Board&apos;s empty
            </p>
            <p className="text-ink/60">
              No open question right now. Check back before the next race.
            </p>
          </div>
        )}

        {event && !locked && (
          <div>
            <p className="text-xs uppercase tracking-board text-green/70 font-semibold mb-1">
              {event.sport} &middot; {event.name}
            </p>
            <h1 className="font-display text-3xl leading-tight text-ink mb-8">
              {event.question}
            </h1>

            <div className="space-y-3">
              {event.question_options.map((option) => (
                <button
                  key={option}
                  onClick={() => lockChoice(option)}
                  disabled={submitting}
                  className="w-full text-left font-display text-xl uppercase tracking-board
                             bg-green text-paper border-2 border-green
                             px-5 py-4 rounded-sm
                             hover:bg-green-deep transition-colors
                             disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="text-xs text-ink/50 mt-6 text-center">
              This is a prediction game about the market, not a bet — no
              money, no odds, no advice.
            </p>
          </div>
        )}

        {locked && (
          <div className="text-center py-16">
            <p className="font-display text-2xl uppercase tracking-board text-green mb-2">
              Locked in
            </p>
            <p className="text-ink/70">
              You called &ldquo;{locked}&rdquo;. Come back once the board
              closes to see how the crowd went.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
