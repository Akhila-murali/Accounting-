import { CheckCircle2, Loader2 } from 'lucide-react';

import Button from './Button.jsx';

export default function ConfirmationModal({
  title,
  message,
  confirmLabel,
  isSubmitting,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-stone-900/40 z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200/60 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="m-0 text-base font-semibold text-stone-900">
              {title}
            </h3>
            <p className="mb-0 mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-500">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
