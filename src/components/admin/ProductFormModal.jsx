import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/initialProducts';
import PillSelect, { originOptions } from '../shared/PillSelect';

const EMOJIS = ['☕', '🌶️', '🧈', '🍯', '🫙', '🍐', '🟤', '🥥', '🌿', '🍋', '🥭', '🍌', '🫐', '🍊'];

const EMPTY = {
  name: '', category: 'Coffee', origin: 'Coorg Farm', pricePerKg: '',
  unit: 'kg', description: '', image: null, emoji: '☕',
  available: true, featured: false,
};

export default function ProductFormModal({ product, onClose }) {
  const { actions } = useStore();
  const isEdit = Boolean(product);
  const [form, setForm] = useState(isEdit ? { ...product } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.pricePerKg || Number(form.pricePerKg) <= 0) e.pricePerKg = 'Valid price required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('image', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form, pricePerKg: Number(form.pricePerKg) };
    if (isEdit) {
      actions.updateProduct(payload);
      actions.toast('Product updated successfully');
    } else {
      actions.addProduct(payload);
      actions.toast('Product added successfully');
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="cart-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Image */}
          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div
              className={`image-upload-area ${form.image ? 'has-image' : ''}`}
              onClick={() => fileRef.current.click()}
            >
              {form.image
                ? <img src={form.image} alt="Preview" />
                : <>
                    <Upload size={24} color="var(--moss)" />
                    <div className="image-upload-text">Click to upload image (JPG, PNG)<br/>or pick an emoji below</div>
                  </>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            {form.image && (
              <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={() => set('image', null)}>Remove Image</button>
            )}
          </div>

          {!form.image && (
            <div className="form-group">
              <label className="form-label">Emoji (shown when no image)</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(em => (
                  <button
                    key={em}
                    onClick={() => set('emoji', em)}
                    style={{
                      fontSize: 24, padding: '6px 10px', borderRadius: 8, border: '2px solid',
                      borderColor: form.emoji === em ? 'var(--forest)' : 'var(--border)',
                      background: form.emoji === em ? 'var(--cream)' : 'transparent', cursor: 'pointer'
                    }}
                  >{em}</button>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arabica Coffee Beans" />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Category + Origin */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <PillSelect
                label="Farm origin"
                options={originOptions()}
                value={form.origin}
                onChange={(v) => set('origin', v)}
                size="sm"
              />
            </div>
          </div>

          {/* Price + Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" type="number" min="1" value={form.pricePerKg} onChange={e => set('pricePerKg', e.target.value)} placeholder="980" />
              {errors.pricePerKg && <span className="form-error">{errors.pricePerKg}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                <option value="kg">per kg</option>
                <option value="piece">per piece</option>
                <option value="L">per litre</option>
                <option value="litre">per litre</option>
                <option value="pack (15 pods)">per pack (15 pods)</option>
                <option value="pod">per pod</option>
                <option value="250g">per 250g</option>
                <option value="500g">per 500g</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the product, its origin, quality..." rows={4} />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="toggle-row">
              <span className="toggle-label">Available for purchase</span>
              <label className="toggle">
                <input type="checkbox" checked={form.available} onChange={e => set('available', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-label">Show in Featured section</span>
              <label className="toggle">
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
