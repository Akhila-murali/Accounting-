import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import Button from './Button.jsx';

export default function Toast({ toast, onClose, duration = 4000 }) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => {
      onCloseRef.current?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [toast, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-4 ${
      isSuccess
        ? 'bg-brand-gold-light border-brand-gold-highlight/60 text-brand-gold'
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}>
      {isSuccess
        ? <CheckCircle2 size={16} className="text-brand-gold" />
        : <AlertCircle size={16} className="text-rose-500" />}
      <span className="text-xs font-semibold">{toast.message}</span>
      <Button
        variant="unstyled"
        icon={X}
        onClick={onClose}
        aria-label="Close notification"
        className="text-stone-400 hover:text-stone-600 bg-transparent border-none cursor-pointer p-0"
      />
    </div>
  );
}
