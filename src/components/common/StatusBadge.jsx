const statusStyles = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Accepted: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
  Saved: 'bg-amber-50 text-amber-700',
  Edited: 'bg-blue-50 text-blue-700',
  Draft: 'bg-stone-100 text-stone-600',
  Rejected: 'bg-rose-50 text-rose-700',
  Expired: 'bg-orange-50 text-orange-700',
  Cancelled: 'bg-rose-50 text-rose-700',
};

export default function StatusBadge({ status }) {
  const label = status || 'Unknown';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      statusStyles[label] || 'bg-stone-100 text-stone-600'
    }`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}
