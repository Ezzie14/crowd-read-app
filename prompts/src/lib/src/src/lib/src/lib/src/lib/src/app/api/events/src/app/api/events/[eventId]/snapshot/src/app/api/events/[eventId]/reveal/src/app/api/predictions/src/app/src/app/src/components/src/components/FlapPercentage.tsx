'use client';

import { useEffect, useState } from 'react';

/**
 * Animates a percentage value the way a tote board's split-flap display
 * would — digits rolling up to the final number rather than a linear
 * progress bar. This is the app's one signature interaction.
 */
export function FlapPercentage({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Math.round(value);
    const duration = 900;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out roll, like a flap losing momentum
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div
      className="flap-tile inline-flex items-baseline bg-ink text-gold-light rounded-sm px-6 py-4 border-2 border-gold shadow-[4px_4px_0_0_#0F3D2E]"
      aria-live="polite"
    >
      <span className="font-display text-6xl tabular-nums tracking-board">
        {display}
      </span>
      <span className="font-display text-2xl ml-1 tracking-board">%</span>
    </div>
  );
}
