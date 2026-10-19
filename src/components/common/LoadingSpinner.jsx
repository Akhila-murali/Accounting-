import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 22, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <Loader2 size={size} className="animate-spin text-brand-gold" />
    </div>
  );
}
