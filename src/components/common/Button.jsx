export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'unstyled'
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  form,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border select-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0 shrink-0';

  const variants = {
    primary:
      'bg-brand-gold hover:bg-brand-gold-hover text-white border-transparent shadow-xs',
    secondary:
      'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 hover:border-stone-300',
    outline:
      'bg-transparent hover:bg-stone-50 text-stone-600 hover:text-stone-900 border-stone-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-xs',
    unstyled: ''
  };

  const selectedVariant = variants[variant] ?? variants.primary;
  const appliedBaseStyles = variant === 'unstyled' ? '' : baseStyles;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      form={form}
      className={`${appliedBaseStyles} ${selectedVariant} ${className}`}
      {...props}
    >
      {Icon && <Icon size={15} className="shrink-0" />}
      {children && <span className="contents">{children}</span>}
    </button>
  );
}
