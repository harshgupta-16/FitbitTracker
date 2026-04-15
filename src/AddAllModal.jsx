import { useState } from 'react';

export default function AddAllModal({ onClose, onAddAll }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    
    // Parse values (if empty, treat as 0 or ignore, but let's say at least one must be > 0, or just parse what they give)
    const calNum = calories ? parseFloat(calories) : 0;
    const proNum = protein ? parseFloat(protein) : 0;
    const carbNum = carbs ? parseFloat(carbs) : 0;
    const fatNum = fats ? parseFloat(fats) : 0;

    if (calNum < 0 || proNum < 0 || carbNum < 0 || fatNum < 0) {
      setError('Values cannot be negative.');
      return;
    }

    if (calNum === 0 && proNum === 0 && carbNum === 0 && fatNum === 0) {
      setError('Please enter at least one value.');
      return;
    }

    if (!date) {
      setError('Please pick a date.');
      return;
    }

    // Call the parent handler with the parsed data
    onAddAll({
      date,
      note: note.trim(),
      calories: calNum,
      protein: proNum,
      carbs: carbNum,
      fats: fatNum
    });
    
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Log All Macros</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => { setDate(e.target.value); setError(''); }}
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
                onChange={(e) => { setCalories(e.target.value); setError(''); }}
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
                onChange={(e) => { setProtein(e.target.value); setError(''); }}
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
                onChange={(e) => { setCarbs(e.target.value); setError(''); }}
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
                onChange={(e) => { setFats(e.target.value); setError(''); }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label>Note (optional)</label>
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

          <button type="submit" className="modal-submit calories" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #4ecdc4, #a855f7)' }}>
            + Add All Entries
          </button>
        </form>
      </div>
    </div>
  );
}
