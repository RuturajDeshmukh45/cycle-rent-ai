import { Bike } from 'lucide-react';

const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-64 gap-4">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center spinner"
      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
    >
      <Bike size={24} color="#fff" />
    </div>
    <p className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-muted)' }}>
      {text}
    </p>
  </div>
);

export default Loader;
