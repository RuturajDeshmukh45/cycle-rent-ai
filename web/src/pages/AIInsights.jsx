import { getRecommendations, getDynamicPricing } from '../services/ai.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { formatCurrency } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Brain, Clock, Route, TrendingUp, Zap } from 'lucide-react';

const AIInsights = () => {
  const { data: recs, loading: rLoading } = useFetch(getRecommendations);
  const { data: pricing } = useFetch(() => getDynamicPricing({ base_price: 15, demand_score: 60 }));

  if (rLoading) return <Loader text="AI analyzing data..." />;

  const demandData = recs?.timeRecommendation?.demandByHour
    ? Object.entries(recs.timeRecommendation.demandByHour).map(([hour, demand]) => ({
        hour: `${hour}h`, demand
      }))
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Brain size={28} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-500 text-sm">Smart suggestions powered by AI</p>
        </div>
      </div>

      {/* Pricing card */}
      {pricing && (
        <div className={`rounded-2xl p-5 mb-6 ${pricing.pricing?.isPeakHour ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Current Dynamic Price</p>
              <p className="text-3xl font-bold">{formatCurrency(pricing.pricing?.finalPrice)}<span className="text-base font-normal opacity-80">/hr</span></p>
              <p className="text-sm opacity-80 mt-1">{pricing.pricing?.pricingReason}</p>
            </div>
            <div className="text-5xl">{pricing.pricing?.isPeakHour ? '🔥' : '✅'}</div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <p className="text-xs opacity-75">Base</p>
              <p className="font-semibold">{formatCurrency(pricing.pricing?.basePrice)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <p className="text-xs opacity-75">Time ×</p>
              <p className="font-semibold">{pricing.pricing?.timeMultiplier}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 text-center">
              <p className="text-xs opacity-75">Demand ×</p>
              <p className="font-semibold">{pricing.pricing?.demandMultiplier}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Demand chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center"><TrendingUp size={18} className="mr-2 text-blue-500" />Demand by Hour</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={demandData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="demand" fill="#3b82f6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best time */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center"><Clock size={18} className="mr-2 text-green-500" />Best Time to Rent</h2>
          <div className="space-y-2">
            {recs?.timeRecommendation?.bestTimeToRent?.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">🕐 {t}</span>
                <span className="text-xs text-green-600 font-medium">Low demand</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-orange-50 rounded-lg p-3">
            <p className="text-xs font-medium text-orange-800">⚠️ Peak Hours (higher price):</p>
            <p className="text-xs text-orange-700 mt-1">{recs?.timeRecommendation?.peakHours?.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center"><Route size={18} className="mr-2 text-purple-500" />Popular Routes</h2>
        <div className="space-y-3">
          {recs?.routeRecommendation?.popularRoutes?.map((route, i) => (
            <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900 text-sm">{route.from} → {route.to}</p>
                <p className="text-xs text-gray-500">{route.distance} · ~{route.estimatedTime}</p>
              </div>
              <div className="flex items-center text-yellow-500">
                {'⭐'.repeat(Math.round(route.rating))}
                <span className="text-xs text-gray-500 ml-1">{route.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Insights */}
      {recs?.userInsights && (
        <div className="bg-blue-50 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center"><Zap size={18} className="mr-2 text-blue-500" />Your Insights</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{recs.userInsights.totalRides}</p>
              <p className="text-xs text-gray-500">Total Rides</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(recs.userInsights.totalSpent)}</p>
              <p className="text-xs text-gray-500">Total Spent</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-600">{recs.userInsights.avgDuration}h</p>
              <p className="text-xs text-gray-500">Avg Duration</p>
            </div>
          </div>
          <p className="text-sm text-blue-700 mt-3">{recs.userInsights.message}</p>
        </div>
      )}
    </div>
  );
};
export default AIInsights;
