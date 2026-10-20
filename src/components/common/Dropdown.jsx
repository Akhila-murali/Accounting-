import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export default function Dropdown({
  name,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  emptyMessage,
  icon: Icon,
  hasError = false,
  onClear,
  menuPlacement = 'bottom',
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({});
  const rootRef = useRef(null);
  const selectedOption = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnScroll = (event) => {
      if (
        event.target instanceof Element &&
        rootRef.current?.contains(event.target)
      ) return;
      setOpen(false);
    };
    window.addEventListener('scroll', closeOnScroll, true);
    return () => window.removeEventListener('scroll', closeOnScroll, true);
  }, [open]);

  const selectValue = (nextValue) => {
    onChange({ target: { name, value: nextValue } });
    setOpen(false);
  };

  const toggleDropdown = () => {
    if (!open) {
      const rect = rootRef.current.getBoundingClientRect();
      setMenuPosition(
        menuPlacement === 'top'
          ? {
              bottom: window.innerHeight - rect.top + 4,
              left: rect.left,
              width: rect.width,
            }
          : {
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
            }
      );
      const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
      );
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
    setOpen((current) => !current);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        toggleDropdown();
        return;
      }
      if (options.length === 0) return;

      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setHighlightedIndex((current) =>
        (current + direction + options.length) % options.length
      );
    }

    if (event.key === 'Enter' && open && options[highlightedIndex]) {
      event.preventDefault();
      selectValue(options[highlightedIndex].value);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0 max-w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={`flex h-[42px] w-full min-w-0 max-w-full items-center gap-2 border rounded-xl text-sm bg-stone-50/50 text-stone-850 focus:outline-none focus:ring-2 focus:bg-white transition-all cursor-pointer ${
          Icon ? 'pl-3.5 pr-3' : 'px-4'
        } ${
          hasError
            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
            : 'border-stone-200 focus:ring-[#c5a059]/20 focus:border-[#c5a059]'
        }`}
      >
        {Icon && <Icon size={16} className="shrink-0 text-stone-400" />}
        <span className={`flex-1 min-w-0 text-left truncate ${value ? '' : 'text-stone-400'}`}>
          {selectedOption?.label || value || placeholder}
        </span>
        {!(onClear && value) && (
          <ChevronDown
            size={16}
            className={`shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {onClear && value && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClear();
            setOpen(false);
          }}
          aria-label={`Clear ${name}`}
          title="Clear selection"
          className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0.5 text-brand-gold transition-colors hover:text-brand-gold-hover"
        >
          <X size={16} />
        </button>
      )}

      {open && (
        <div
          role="listbox"
          style={menuPosition}
          className="fixed z-[100] max-h-36 overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-xl"
        >
          {options.length === 0 && emptyMessage && (
            <div className="px-3 py-2 text-sm text-stone-400">
              {emptyMessage}
            </div>
          )}
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={String(value) === String(option.value)}
              onClick={() => selectValue(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full min-w-0 flex items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 cursor-pointer ${
                highlightedIndex === index ? 'bg-[#c5a059]/10' : 'hover:bg-[#c5a059]/10'
              }`}
            >
              <span className="flex-1 min-w-0 truncate">{option.label}</span>
              {String(value) === String(option.value) && <Check size={15} className="shrink-0 text-[#9a741e]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
