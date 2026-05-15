const Button = ({ children, variant = 'primary', className = '', disabled, loading, ...props }) => {
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-secondary';
  return (
    <button className={`${cls} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <span className="spinner inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;
