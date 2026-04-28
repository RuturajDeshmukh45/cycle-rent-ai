const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
    <p className="text-gray-500 text-sm">{text}</p>
  </div>
);
export default Loader;
