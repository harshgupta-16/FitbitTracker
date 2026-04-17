import { useState, useEffect } from 'react';

export default function AddAllModal({ onClose, appData, onOverwriteDay, onDeleteDay }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const [hasExistingData, setHasExistingData] = useState(false);

  // When date changes, check if we have data for this date
  useEffect(() => {
    if (!appData) return;
    let totalCals = 0, totalPro = 0, totalCarb = 0, totalFat = 0;

    appData.calories?.forEach(e => { if (e.date === date) totalCals += e.value; });
    appData.protein?.forEach(e => { if (e.date === date) totalPro += e.value; });
    appData.carbs?.forEach(e => { if (e.date === date) totalCarb += e.value; });
    appData.fats?.forEach(e => { if (e.date === date) totalFat += e.value; });

    if (totalCals > 0 || totalPro > 0 || totalCarb > 0 || totalFat > 0) {
      setCalories(totalCals ? Math.round(totalCals * 10) / 10 : '');
      setProtein(totalPro ? Math.round(totalPro * 10) / 10 : '');
      setCarbs(totalCarb ? Math.round(totalCarb * 10) / 10 : '');
      setFats(totalFat ? Math.round(totalFat * 10) / 10 : '');
      setHasExistingData(true);
    } else {
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setHasExistingData(false);
    }
    setError('');
  }, [date, appData]);

  function handleSubmit(e) {
    e.preventDefault();

    const calNum = calories ? parseFloat(calories) : 0;
    const proNum = protein ? parseFloat(protein) : 0;
    const carbNum = carbs ? parseFloat(carbs) : 0;
    const fatNum = fats ? parseFloat(fats) : 0;

    if (calNum < 0 || proNum < 0 || carbNum < 0 || fatNum < 0) {
      setError('Values cannot be negative.');
      return;
    }

    if (calNum === 0 && proNum === 0 && carbNum === 0 && fatNum === 0) {
      setError('Please enter at least one value. (If you want to clear the day, use Delete instead)');
      return;
    }

    if (!date) {
      setError('Please pick a date.');
      return;
    }

    onOverwriteDay(date, {
      date,
      note: note.trim(),
      calories: calNum,
      protein: proNum,
      carbs: carbNum,
      fats: fatNum
    });

    onClose();
  }

  function handleDeleteClick() {
    if (window.confirm('Are you sure you want to delete all entries for this date?')) {
      onDeleteDay(date);
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{hasExistingData ? 'Edit Day' : 'Log All Macros'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              // max={today}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ color: 'var(--calories-color)' }}>🔥 Calories (kcal)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 500"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--protein-color)' }}>💪 Protein (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 30"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--carbs-color)' }}>🌾 Carbs (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 45"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ color: 'var(--fats-color)' }}>🥑 Fats (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 15"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label>Note (optional, overrides existing)</label>
            <input
              type="text"
              placeholder="e.g. Breakfast, Lunch…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '-4px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            {hasExistingData && (
              <button
                type="button"
                className="modal-submit"
                style={{ flex: 1, background: 'rgba(255, 80, 80, 0.15)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)' }}
                onClick={handleDeleteClick}
              >
                Delete Day
              </button>
            )}
            <button
              type="submit"
              className="modal-submit calories"
              style={{ flex: 2, background: 'linear-gradient(135deg, #4ecdc4, #a855f7)' }}
            >
              {hasExistingData ? 'Save Overwrite' : '+ Add All Entries'}
            </button>
          </div>
          {hasExistingData && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', textAlign: 'center' }}>
              Saving will replace all entries from this date with these totals.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
