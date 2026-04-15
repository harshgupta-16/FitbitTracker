import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import AddEntryModal from './AddEntryModal';

const CONFIG = {
  calories: {
    label:    'Calories',
    unit:     'kcal',
    icon:     '🔥',
    colorVar: 'var(--calories-color)',
    gradient: ['#ff6b6b', '#ff8e53'],
    gradId:   'calGrad',
  },
  protein: {
    label:    'Protein',
    unit:     'g',
    icon:     '💪',
    colorVar: 'var(--protein-color)',
    gradient: ['#4ecdc4', '#44a3ee'],
    gradId:   'proGrad',
  },
  carbs: {
    label:    'Carbohydrates',
    unit:     'g',
    icon:     '🌾',
    colorVar: 'var(--carbs-color)',
    gradient: ['#ffe66d', '#f9a825'],
    gradId:   'carbGrad',
  },
  fats: {
    label:    'Fats',
    unit:     'g',
    icon:     '🥑',
    colorVar: 'var(--fats-color)',
    gradient: ['#a855f7', '#ec4899'],
    gradId:   'fatGrad',
  },
};

/* Aggregate entries by date → sum values per day */
function aggregateByDate(entries) {
  const map = {};
  entries.forEach(({ date, value }) => {
    map[date] = (map[date] || 0) + value;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({
      date,
      display: formatDate(date),
      total: Math.round(total * 10) / 10,
    }));
}

function formatDate(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{payload[0]?.payload?.date}</div>
      <div className="value" style={{ color: payload[0]?.stroke }}>
        {payload[0]?.value} <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{unit}</span>
      </div>
    </div>
  );
}

export default function NutrientChart({ nutrient, entries, onAdd, onDelete }) {
  const cfg = CONFIG[nutrient];
  const [showModal, setShowModal]   = useState(false);
  const [showLog, setShowLog]       = useState(false);

  const chartData = useMemo(() => aggregateByDate(entries), [entries]);

  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return entries
      .filter(e => e.date === today)
      .reduce((s, e) => s + e.value, 0);
  }, [entries]);

  const allDays = useMemo(() => new Set(entries.map(e => e.date)).size, [entries]);
  const allTotal = useMemo(() => entries.reduce((s, e) => s + e.value, 0), [entries]);
  const average = allDays > 0 ? Math.round((allTotal / allDays) * 10) / 10 : 0;

  return (
    <>
      <div className={`chart-card ${nutrient}`}>
        {/* Gradient defs */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id={cfg.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={cfg.gradient[0]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cfg.gradient[1]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
        </svg>

        <div className="chart-header">
          <div className="chart-title-group">
            <div className="chart-icon">{cfg.icon}</div>
            <div>
              <div className="chart-title">{cfg.label}</div>
              <div className="chart-subtitle">
                Today:{' '}
                <strong style={{ color: cfg.colorVar }}>
                  {Math.round(todayTotal * 10) / 10} {cfg.unit}
                </strong>
                {allDays > 0 && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                    · Avg: {average} {cfg.unit}/day
                  </span>
                )}
              </div>
            </div>
          </div>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>＋</span>
            Add
          </button>
        </div>

        {/* Chart or empty state */}
        {chartData.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">{cfg.icon}</span>
            <p>No data yet — click <strong>Add</strong> to log {cfg.label.toLowerCase()}</p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id={`fill-${cfg.gradId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"   stopColor={cfg.gradient[0]} stopOpacity={0.3} />
                    <stop offset="95%"  stopColor={cfg.gradient[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="display"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip unit={cfg.unit} />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={cfg.gradient[0]}
                  strokeWidth={2.5}
                  fill={`url(#fill-${cfg.gradId})`}
                  dot={{ fill: cfg.gradient[0], r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: cfg.gradient[0], stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Log toggle */}
        {entries.length > 0 && (
          <button className="log-toggle" onClick={() => setShowLog(v => !v)}>
            {showLog ? '▲ Hide' : '▼ Show'} entry log ({entries.length})
          </button>
        )}

        {/* Entry log table */}
        {showLog && entries.length > 0 && (
          <div className="log-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Value ({cfg.unit})</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...entries]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td style={{ color: cfg.colorVar, fontWeight: 600 }}>{e.value}</td>
                      <td>{e.note || '—'}</td>
                      <td>
                        <button className="delete-row-btn" onClick={() => onDelete(e.id)} title="Delete">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddEntryModal
          nutrient={nutrient}
          onClose={() => setShowModal(false)}
          onAdd={(entry) => onAdd(nutrient, entry)}
        />
      )}
    </>
  );
}
