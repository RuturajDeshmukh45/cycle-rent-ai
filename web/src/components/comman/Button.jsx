const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  success: 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold font-[Syne] transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold font-[Syne] transition-all border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
};
const sizes = { sm: 'text-xs px-3 py-2', md: '', lg: 'text-base px-6 py-3' };

const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) => (
  <button
    className={`${variants[variant]} ${sizes[size]} ${className}`}
    style={variant === 'outline' ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' } : {}}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    )}
    {children}
  </button>
);
export default Button;
