type ActionButtonsProps = {
  onPurchaseClick: () => void;
  onSubscribeClick: () => void;
};

export function ActionButtons({
  onPurchaseClick,
  onSubscribeClick,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onPurchaseClick}
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Purchase
      </button>
      <button
        type="button"
        onClick={onSubscribeClick}
        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        Subscribe
      </button>
    </div>
  );
}
