import { getRecommendations, getDynamicPricing } from '../services/ai.service';
import useFetch from '../hooks/useFetch';
import Loader from '../components/comman/Loader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Brain, Clock, Route, TrendingUp, Zap, Star } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-2.5 text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontFamily: 'Syne', color: 'var(--text-primary)' }}>
      <p className="font-bold">{label}</p>
      <p style={{ color: 'var(--accent)' }}>Demand: {payload[0]?.value}</p>
    </div>
  );
};

const AIInsights = () => {
  const { data: recs, loading } = useFetch(getRecommendations);
  const { data: pricing } = useFetch(() => getDynamicPricing({ base_price: 15, demand_score: 60 }));

  if (loading) return <Loader text="AI analyzing your data..." />;

  const demandData = recs?.timeRecommendation?.demandByHour
    ? Object.entries(recs.timeRecommendation.demandByHour).map(([h, d]) => ({ hour: `${h}h`, demand: d }))
    : [];

  const isPeak = pricing?.pricing?.isPeakHour;

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', boxShadow: 'var(--shadow-accent)' }}>
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>AI Insights</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Smart suggestions powered by AI</p>
        </div>
      </div>

      {/* Dynamic pricing hero */}
      {pricing && (
        <div className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: isPeak ? 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(15,26,53,0.9))' : 'var(--gradient-hero)', border: `1px solid ${isPeak ? 'rgba(245,158,11,0.25)' : 'var(--border-strong)'}` }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${isPeak ? '#f59e0b' : 'var(--accent)'},transparent)` }} />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ fontFamily: 'Syne', color: 'rgba(255,255,255,0.5)' }}>Current Dynamic Price</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Syne' }}>₹{pricing.pricing?.finalPrice}</span>
                <span className="text-sm text-white/60">/hr</span>
              </div>
              <p className="text-xs text-white/70">{pricing.pricing?.pricingReason}</p>
            </div>
            <div className="text-5xl">{isPeak ? '🔥' : '✅'}</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { l: 'Base', v: `₹${pricing.pricing?.basePrice}` },
              { l: 'Time ×', v: pricing.pricing?.timeMultiplier },
              { l: 'Demand ×', v: pricing.pricing?.demandMultiplier },
            ].map(({ l, v }) => (
              <div key={l} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p className="text-xs text-white/50">{l}</p>
                <p className="text-sm font-bold text-white" style={{ fontFamily: 'Syne' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Demand chart */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Demand by Hour</h2>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={demandData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={3} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="demand" fill="var(--accent)" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best time */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} style={{ color: 'var(--success)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Best Time to Rent</h2>
          </div>
          <div className="space-y-2 mb-3">
            {recs?.timeRecommendation?.bestTimeToRent?.slice(0, 4).map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>🕐 {t}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--success)', fontFamily: 'Syne' }}>Low demand</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b', fontFamily: 'Syne' }}>⚠ Peak Hours (higher price)</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{recs?.timeRecommendation?.peakHours?.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Route size={16} style={{ color: '#a78bfa' }} />
          <h2 className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Popular Routes</h2>
        </div>
        <div className="space-y-2">
          {recs?.routeRecommendation?.popularRoutes?.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl p-3 transition-colors" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>{r.from} → {r.to}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.distance} · ~{r.estimatedTime}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                <span className="text-xs font-bold" style={{ fontFamily: 'Syne', color: '#f59e0b' }}>{r.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Insights */}
      {recs?.userInsights && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--gradient-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}>Your Insights</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { label: 'Total Rides', value: recs.userInsights.totalRides, color: 'var(--accent)' },
              { label: 'Total Spent', value: `₹${recs.userInsights.totalSpent}`, color: '#10b981' },
              { label: 'Avg Duration', value: `${recs.userInsights.avgDuration}h`, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xl font-extrabold" style={{ fontFamily: 'Syne', color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>{recs.userInsights.message}</p>
        </div>
      )}
    </div>
  );
};
export default AIInsights;
