import { useEffect, useState } from 'react';

export default function StatCard({ label, value, subtext, icon, formatValue, compact = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const steps = 30;
    const increment = Math.ceil(value / steps);

    const timer = setInterval(() => {
      current += increment;

      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`bg-white border border-stone-200/60 rounded-2xl flex min-w-0 flex-col justify-between shadow-xs ${compact ? 'p-3 sm:p-4' : 'p-5 sm:min-w-[280px]'}`}>
      <div className={`flex items-center ${compact ? 'gap-2 sm:gap-3 mb-3' : 'gap-4 mb-4'}`}>
        <div
          className={`${compact ? 'h-9 w-9' : 'h-10 w-10'} flex shrink-0 items-center justify-center rounded-xl border border-brand-gold-highlight/25 text-brand-gold`}
          style={{ backgroundImage: 'var(--gradient-icon-gold)' }}
        >
          {icon}
        </div>

        <div>
          <p className="text-stone-500 text-xs font-semibold m-0">{label}</p>
          <h3 className={`text-stone-900 font-bold m-0 mt-1 ${compact ? 'text-xl sm:text-2xl' : 'text-2xl'}`}>{formatValue ? formatValue(count) : count}</h3>
        </div>
      </div>

      <p className={`text-stone-400 text-xs m-0 ${compact ? 'hidden sm:block' : ''}`}>{subtext}</p>
    </div>
  );
}
