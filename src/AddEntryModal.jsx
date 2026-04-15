import { useState } from 'react';

const UNIT_MAP = {
  calories: 'kcal',
  protein:  'g',
  carbs:    'g',
  fats:     'g',
};

export default function AddEntryModal({ nutrient, onClose, onAdd }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate]   = useState(today);
  const [value, setValue] = useState('');
  const [note, setNote]   = useState('');
  const [error, setError] = useState('');

  const label = nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
  const unit  = UNIT_MAP[nutrient];

  function handleSubmit(e) {
    e.preventDefault();
    const num = parseFloat(value);
    if (!value || isNaN(num) || num <= 0) {
      setError('Please enter a valid positive number.');
      return;
    }
    if (!date) {
      setError('Please pick a date.');
      return;
    }
    onAdd({ date, value: num, note: note.trim() });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add {label} Entry</span>
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

          <div className="form-group">
            <label>{label} ({unit})</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder={`e.g. ${nutrient === 'calories' ? '500' : '30'}`}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
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

          <button type="submit" className={`modal-submit ${nutrient}`}>
            + Add Entry
          </button>
        </form>
      </div>
    </div>
  );
}
