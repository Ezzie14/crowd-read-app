'use client';

import { useEffect, useState } from 'react';
import { BoardHeader } from '@/components/BoardHeader';
import { FlapPercentage } from '@/components/FlapPercentage';

interface Reveal {
  script_text: string;
  audio_url: string;
  crowd_accuracy_pct: number;
}

export default function RevealPage({ params }: { params: { eventId: string } }) {
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const res = await fetch(`/api/events/${params.eventId}/reveal`);
      const data = await res.json();
      if (cancelled) return;

      if (data && data.script_text) {
        setReveal(data);
        setLoading(false);
      } else {
        // reveal not generated yet — check again shortly
        setTimeout(poll, 4000);
      }
    }
    poll();

    return () => {
      cancelled = true;
    };
  }, [params.eventId]);

  return (
    <main className="min-h-screen bg-paper">
      <BoardHeader />

      <div className="max-w-md mx-auto px-5 py-10 text-center">
        {loading && (
          <p className="font-body text-ink/60 py-20">
            Board&apos;s closing&hellip; the Sommelier&apos;s having a look.
          </p>
        )}

        {reveal && (
          <div>
            <p className="text-xs uppercase tracking-board text-green/70 font-semibold mb-4">
              Crowd accuracy
            </p>
            <div className="flex justify-center mb-8">
              <FlapPercentage value={reveal.crowd_accuracy_pct} />
            </div>

            <audio controls autoPlay src={reveal.audio_url} className="w-full mb-6" />

            <p className="text-ink/80 leading-relaxed text-left bg-white/40 border border-gold/40 rounded-sm p-4">
              {reveal.script_text}
            </p>

            <a
              href="/"
              className="inline-block mt-8 font-display uppercase tracking-board text-sm text-green underline underline-offset-4"
            >
              Back to today&apos;s board
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
