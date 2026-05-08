const Loader = ({ text = 'Loading...', fullPage = false }) => (
  <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'min-h-screen' : 'py-20'}`}>
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-2 opacity-10" style={{ borderColor: 'var(--accent)' }} />
      <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: 'var(--accent)' }} />
      <div className="absolute inset-2 rounded-full flex items-center justify-center text-lg">🚲</div>
    </div>
    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{text}</p>
  </div>
);
export default Loader;
