const Input = ({ label, error, hint, icon, className = '', ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>
        {label}
      </label>
    )}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{icon}</span>}
      <input
        className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'error' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: 'var(--danger)' }}>⚠ {error}</p>}
    {hint && !error && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
  </div>
);
export default Input;
