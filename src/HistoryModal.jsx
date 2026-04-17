import React, { useState, useMemo } from 'react';

const NUTRIENTS = ['calories', 'protein', 'carbs', 'fats'];

export default function HistoryModal({ onClose, appData }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const aggregatedData = useMemo(() => {
    const days = {};
    NUTRIENTS.forEach(n => {
      appData[n].forEach(e => {
        if (!days[e.date]) {
          days[e.date] = { date: e.date, calories: 0, protein: 0, carbs: 0, fats: 0 };
        }
        days[e.date][n] += e.value;
      });
    });
    
    let result = Object.values(days).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (fromDate) {
      result = result.filter(d => d.date >= fromDate);
    }
    if (toDate) {
      result = result.filter(d => d.date <= toDate);
    }
    
    return result;
  }, [appData, fromDate, toDate]);

  const clearFilter = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h2 className="modal-title">🗓️ Historical Macros</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>From Date</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>To Date</label>
            <input 
              type="date" 
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          {(fromDate || toDate) && (
            <button 
              onClick={clearFilter}
              style={{
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--border)', 
                color: 'var(--text-secondary)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.target.style.background = 'var(--bg-card-hover)';
                e.target.style.color = 'var(--text-primary)';
              }}
              onMouseOut={e => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="log-table" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Calories (kcal)</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fats (g)</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.length > 0 ? (
                aggregatedData.map(d => (
                  <tr key={d.date}>
                    <td>{d.date}</td>
                    <td style={{color: 'var(--calories-color)'}}><strong>{Math.round(d.calories * 10) / 10}</strong></td>
                    <td style={{color: 'var(--protein-color)'}}><strong>{Math.round(d.protein * 10) / 10}</strong></td>
                    <td style={{color: 'var(--carbs-color)'}}><strong>{Math.round(d.carbs * 10) / 10}</strong></td>
                    <td style={{color: 'var(--fats-color)'}}><strong>{Math.round(d.fats * 10) / 10}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                    No macro history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
