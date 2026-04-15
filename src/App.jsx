import { useState, useMemo, useEffect, useCallback } from 'react';
import './index.css';
import './App.css';
import NutrientChart from './NutrientChart';
import AddAllModal from './AddAllModal';
import {
  FIREBASE_CONFIGURED,
  fetchEntries,
  addEntry   as fbAdd,
  deleteEntry as fbDelete,
} from './firebase';

const NUTRIENTS  = ['calories', 'protein', 'carbs', 'fats'];
const UNITS      = { calories: 'kcal', protein: 'g', carbs: 'g', fats: 'g' };
const ICONS      = { calories: '🔥', protein: '💪', carbs: '🌾', fats: '🥑' };
const STORAGE_KEY = 'nutrition-tracker-data';

// ─── localStorage helpers ─────────────────────────────────────────────────────
function emptyData() {
  return { calories: [], protein: [], carbs: [], fats: [] };
}
function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : emptyData();
  } catch {
    return emptyData();
  }
}
function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Calc: average per logged day ─────────────────────────────────────────────
function calcAverage(entries) {
  if (!entries.length) return 0;
  const days = new Set(entries.map(e => e.date));
  const total = entries.reduce((s, e) => s + e.value, 0);
  return Math.round((total / days.size) * 10) / 10;
}

// ─── Date helper ─────────────────────────────────────────────────────────────
function formatDisplayDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}
function todayIso() {
  return new Date().toISOString().split('T')[0];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData]       = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [dbMode, setDbMode]   = useState('local'); // 'firebase' | 'local'
  const [showAddAll, setShowAddAll] = useState(false);

  // ── Bootstrap: load from Firebase or localStorage ──────────────────────────
  useEffect(() => {
    (async () => {
      if (FIREBASE_CONFIGURED) {
        try {
          const result = await fetchEntries();
          if (result) {
            setData(result);
            setDbMode('firebase');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Firebase fetch failed, falling back to localStorage', err);
        }
      }
      // fallback
      setData(loadLocal());
      setDbMode('local');
      setLoading(false);
    })();
  }, []);

  // ── Persist to localStorage whenever data changes (local mode only) ────────
  useEffect(() => {
    if (dbMode === 'local' && !loading) {
      saveLocal(data);
    }
  }, [data, dbMode, loading]);

  // ── Add entry ──────────────────────────────────────────────────────────────
  const handleAdd = useCallback(async (nutrient, entry) => {
    if (dbMode === 'firebase') {
      try {
        const saved = await fbAdd(nutrient, entry);
        if (saved) {
          setData(prev => ({ ...prev, [nutrient]: [...prev[nutrient], saved] }));
          return;
        }
      } catch (err) {
        console.error('Firebase add failed, saving locally', err);
      }
    }
    // local fallback
    const newEntry = { ...entry, id: `${Date.now()}-${Math.random()}` };
    setData(prev => ({ ...prev, [nutrient]: [...prev[nutrient], newEntry] }));
  }, [dbMode]);

  // ── Delete all for specific date ───────────────────────────────────────────
  const handleDeleteDayAll = useCallback(async (date) => {
    let toDelete = [];
    NUTRIENTS.forEach(n => {
      data[n].forEach(e => {
        if (e.date === date) toDelete.push(e.id);
      });
    });

    if (dbMode === 'firebase') {
      try {
        for (const id of toDelete) {
          await fbDelete(id);
        }
      } catch (err) {
        console.error('Firebase delete failed', err);
      }
    }

    setData(prev => {
      const next = { ...prev };
      NUTRIENTS.forEach(n => {
        next[n] = next[n].filter(e => e.date !== date);
      });
      return next;
    });
  }, [data, dbMode]);

  // ── Overwrite entries for a date ───────────────────────────────────────────
  const handleOverwriteDay = useCallback(async (date, dataObj) => {
    // 1. Delete all existing data for this date
    await handleDeleteDayAll(date);
    
    // 2. Add the new values
    const common = { date: dataObj.date, note: dataObj.note };
    
    if (dataObj.calories > 0) await handleAdd('calories', { ...common, value: dataObj.calories });
    if (dataObj.protein > 0) await handleAdd('protein', { ...common, value: dataObj.protein });
    if (dataObj.carbs > 0) await handleAdd('carbs', { ...common, value: dataObj.carbs });
    if (dataObj.fats > 0) await handleAdd('fats', { ...common, value: dataObj.fats });
  }, [handleAdd, handleDeleteDayAll]);

  // ── Delete entry ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (nutrient, id) => {
    if (dbMode === 'firebase') {
      try {
        await fbDelete(id);
      } catch (err) {
        console.error('Firebase delete failed', err);
      }
    }
    setData(prev => ({
      ...prev,
      [nutrient]: prev[nutrient].filter(e => e.id !== id),
    }));
  }, [dbMode]);

  // ── Averages for summary strip ─────────────────────────────────────────────
  const averages = useMemo(() => {
    const result = {};
    NUTRIENTS.forEach(n => { result[n] = calcAverage(data[n]); });
    return result;
  }, [data]);

  // ── How many unique days logged overall ────────────────────────────────────
  const totalDays = useMemo(() => {
    const allDates = new Set(
      NUTRIENTS.flatMap(n => data[n].map(e => e.date))
    );
    return allDates.size;
  }, [data]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🍽️ Nutrition Tracker</h1>
          <p>
            Log your daily calories &amp; macros ·{' '}
            <span className={`db-badge ${dbMode}`}>
              {dbMode === 'firebase' ? '☁️ Cloud sync ON' : '💾 Local only'}
            </span>
          </p>
        </div>
        <div className="header-date" onClick={() => setShowAddAll(true)} title="Log all macros for a day">
          📅 {formatDisplayDate(todayIso())}
          <span style={{ marginLeft: 4, opacity: 0.6, fontSize: '0.9rem' }}>+</span>
        </div>
      </header>

      {/* Firebase setup banner */}
      {dbMode === 'local' && (
        <div className="setup-banner">
          <span>☁️</span>
          <span>
            <strong>Cross-device sync is off.</strong> To enable it, add your Firebase
            credentials to <code>src/firebase.js</code>. See the instructions inside
            that file.
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading your data…</p>
        </div>
      ) : (
        <>
          {/* Average summary cards */}
          <div className="summary-strip">
            {NUTRIENTS.map(n => (
              <div key={n} className={`summary-card ${n}`}>
                <div className="summary-label">{ICONS[n]} {n}</div>
                <div className="summary-value">
                  {averages[n]}
                  <span className="summary-unit">{UNITS[n]}</span>
                </div>
                <div className="summary-sub">
                  Avg / day {totalDays > 0 ? `(${totalDays} day${totalDays > 1 ? 's' : ''})` : '— no data'}
                </div>
              </div>
            ))}
          </div>

          {/* 4 charts */}
          <div className="charts-grid">
            {NUTRIENTS.map(n => (
              <NutrientChart
                key={n}
                nutrient={n}
                entries={data[n]}
                onAdd={handleAdd}
                onDelete={(id) => handleDelete(n, id)}
              />
            ))}
          </div>
        </>
      )}

      {showAddAll && (
        <AddAllModal
          onClose={() => setShowAddAll(false)}
          appData={data}
          onOverwriteDay={handleOverwriteDay}
          onDeleteDay={handleDeleteDayAll}
        />
      )}
    </div>
  );
}
