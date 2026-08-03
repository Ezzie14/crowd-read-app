export function BoardHeader() {
  return (
    <header className="bg-green text-paper border-b-4 border-gold">
      <div className="max-w-md mx-auto px-5 py-4 flex items-baseline justify-between">
        <span className="font-display text-2xl tracking-board uppercase">
          Crowd Read
        </span>
        <span className="font-body text-xs uppercase tracking-board text-gold-light">
          Read the market
        </span>
      </div>
    </header>
  );
}
