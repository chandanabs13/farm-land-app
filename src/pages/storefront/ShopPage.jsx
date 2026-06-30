import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/storefront/ProductCard';
import { CATEGORIES } from '../../data/initialProducts';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function ShopPage() {
  const { computed } = useStore();
  usePageMeta({
    title: 'Shop',
    description: 'Browse farm-fresh coffee, pepper, ghee, honey and seasonal fruits from Coorg and Bangalore.',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || 'All');
  const [selectedOrigin, setSelectedOrigin] = useState('All');

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setSelectedCat(cat);
  }, [searchParams]);

  const filtered = computed.availableProducts.filter(p => {
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    const matchOrigin = selectedOrigin === 'All' || p.origin.includes(selectedOrigin.split(' ')[0]);
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchOrigin && matchSearch;
  });

  const handleCat = (cat) => {
    setSelectedCat(cat);
    setSearchParams(cat !== 'All' ? { cat } : {});
  };

  return (
    <div className="section">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
          <div className="section-eyebrow">Our products</div>
          <h1 className="section-title">Farm Fresh Shop</h1>
          <p className="section-subtitle" style={{ margin: 0, maxWidth: 'none' }}>
            Only what's in season and in stock. Prices are per kg unless noted.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
          <select className="form-select" style={{ flex: '0 0 auto', width: 'auto', minWidth: 140 }} value={selectedOrigin} onChange={e => setSelectedOrigin(e.target.value)}>
            <option value="All">All Farms</option>
            <option value="Coorg">Coorg Farm</option>
            <option value="Bangalore">Bangalore Farm</option>
          </select>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => handleCat(cat)}
              className={`btn btn-sm ${selectedCat === cat ? 'btn-primary' : 'btn-secondary'}`}
            >{cat}</button>
          ))}
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div className="product-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🌿</div>
            <h3 className="empty-state-title">Nothing here right now</h3>
            <p className="empty-state-desc">
              Some products are seasonal. Try a different category or check back soon.
            </p>
            <button className="btn btn-primary" onClick={() => { setSelectedCat('All'); setSearch(''); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
