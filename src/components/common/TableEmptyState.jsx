import { Inbox } from 'lucide-react';

export default function TableEmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-5 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-stone-400">
        <Inbox size={22} strokeWidth={1.7} />
      </div>
      <p className="m-0 text-sm font-semibold text-stone-800">{title}</p>
      <p className="m-0 mt-1 max-w-xs text-xs leading-5 text-stone-500">
        {message}
      </p>
    </div>
  );
}
