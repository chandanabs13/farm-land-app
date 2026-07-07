import { useState, useRef, useEffect } from 'react';

export default function SearchSelect({
  label,
  placeholder = 'Type to search…',
  options,
  value,
  onChange,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return o.label.toLowerCase().includes(q) || o.value.includes(q);
  });

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pick = (opt) => {
    onChange(opt.value);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="form-group search-select" ref={wrapRef}>
      <label className="form-label">{label} *</label>
      <input
        className="form-input"
        placeholder={selected ? selected.label : placeholder}
        value={open ? query : selected?.label || ''}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <ul className="search-select-list" role="listbox">
          {filtered.length === 0 ? (
            <li className="search-select-empty">No matches</li>
          ) : (
            filtered.slice(0, 80).map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`search-select-option${opt.value === value ? ' active' : ''}`}
                  onClick={() => pick(opt)}
                >
                  {opt.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
