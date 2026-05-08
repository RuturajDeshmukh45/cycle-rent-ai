import CycleCard from './CycleCard';

const CycleList = ({ cycles, loading }) => {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="skeleton h-28" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-8 w-full mt-3" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!cycles?.length) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🚲</div>
      <p className="font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'Syne' }}>No cycles found</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try changing your search filters</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cycles.map(c => <CycleCard key={c.id} cycle={c} />)}
    </div>
  );
};
export default CycleList;
