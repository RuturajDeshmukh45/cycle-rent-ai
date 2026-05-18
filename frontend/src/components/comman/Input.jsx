const Input = ({ label, error, icon: Icon, className = '', ...props }) => (
  <div>
    {label && (
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
        style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }} />
      )}
      <input
        className={`input-field ${Icon ? 'pl-9' : ''} ${error ? 'error' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs font-medium" style={{ color: 'var(--danger)' }}>⚠ {error}</p>}
  </div>
);

export default Input;
