import CycleCard from './CycleCard';
import Loader from '../comman/Loader';

const CycleList = ({ cycles, loading }) => {
  if (loading) return <Loader text="Finding nearby cycles..." />;
  if (!cycles?.length) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🚲</div>
      <p className="text-gray-500">No cycles found. Try changing filters.</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cycles.map((c) => <CycleCard key={c.id} cycle={c} />)}
    </div>
  );
};
export default CycleList;
