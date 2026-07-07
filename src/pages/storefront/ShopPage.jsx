import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/storefront/ProductCard';
import { CATEGORIES } from '../../data/initialProducts';
import { usePageMeta } from '../../hooks/usePageMeta';
import PillSelect, { SHOP_FARM_FILTERS } from '../../components/shared/PillSelect';

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

        <div className="shop-filters">
          <div className="shop-search-wrap">
            <Search size={16} className="shop-search-icon" />
            <input
              className="form-input shop-search-input"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <PillSelect
            label="Farm"
            options={SHOP_FARM_FILTERS}
            value={selectedOrigin}
            onChange={setSelectedOrigin}
            size="sm"
          />
        </div>

        <div className="shop-category-filters">
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
            <button className="btn btn-primary" onClick={() => { setSelectedCat('All'); setSearch(''); setSelectedOrigin('All'); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
