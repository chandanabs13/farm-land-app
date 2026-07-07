const FARM_META = {
  'Coorg Farm': { emoji: '🌿', short: 'Coorg' },
  'Bangalore Farm': { emoji: '🌳', short: 'Bangalore' },
  'Both Farms': { emoji: '🌾', short: 'Both' },
};

export default function PillSelect({ label, options, value, onChange, size = 'md' }) {
  return (
    <div className={`pill-select pill-select-${size}`}>
      {label && <span className="pill-select-label">{label}</span>}
      <div className="pill-select-options" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`pill-select-btn${value === opt.value ? ' active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.emoji && <span className="pill-select-emoji" aria-hidden>{opt.emoji}</span>}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function originOptions() {
  return ['Coorg Farm', 'Bangalore Farm', 'Both Farms'].map((o) => ({
    value: o,
    label: FARM_META[o]?.short || o,
    emoji: FARM_META[o]?.emoji,
  }));
}

export const SHOP_FARM_FILTERS = [
  { value: 'All', label: 'All Farms', emoji: '🌾' },
  { value: 'Coorg', label: 'Coorg', emoji: '🌿' },
  { value: 'Bangalore', label: 'Bangalore', emoji: '🌳' },
];
