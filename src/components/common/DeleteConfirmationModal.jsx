import { Loader2, Trash2 } from 'lucide-react';
import Button from './Button.jsx';

export default function DeleteConfirmationModal({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  submittingLabel = 'Deleting...',
  isDeleting = false,
  tone = 'danger',
  onCancel,
  onConfirm,
}) {
  const isBrand = tone === 'brand';

  return (
    <div className="fixed inset-0 bg-stone-900/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isBrand
              ? 'bg-brand-gold-light text-brand-gold'
              : 'bg-rose-50 text-rose-500'
          }`}>
            <Trash2 size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-stone-900 m-0">{title}</h3>
            <p className="text-sm text-stone-500 m-0 mt-2 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>{cancelLabel}</Button>
          <Button variant={isBrand ? 'primary' : 'danger'} onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? <><Loader2 size={14} className="animate-spin" /><span>{submittingLabel}</span></> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
