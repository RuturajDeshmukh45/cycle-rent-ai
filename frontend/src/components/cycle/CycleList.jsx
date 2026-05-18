import CycleCard from './CycleCard';
import { Bike } from 'lucide-react';

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
    <div className="skeleton" style={{ height: '140px' }} />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-8 w-full rounded-lg" />
    </div>
  </div>
);

const CycleList = ({ cycles, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!cycles?.length) {
    return (
      <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1.5px dashed var(--border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
          style={{ background: 'var(--bg-input)' }}>
          <Bike size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="font-bold mb-1" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-secondary)' }}>No cycles found</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try changing filters or search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cycles.map(c => <CycleCard key={c.id} cycle={c} />)}
    </div>
  );
};

export default CycleList;
