import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, ShoppingCart, ArrowLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { state, actions } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const product = state.products.find(p => p.id === id);

  if (!product) return (
    <div className="container section">
      <div className="empty-state">
        <div className="empty-state-icon">🌿</div>
        <h3 className="empty-state-title">Product not found</h3>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    </div>
  );

  if (!product.available) return (
    <div className="container section">
      <div className="empty-state">
        <div className="empty-state-icon">{product.emoji}</div>
        <h3 className="empty-state-title">{product.name}</h3>
        <p className="empty-state-desc">This product is currently out of season or unavailable. Check back soon!</p>
        <Link to="/shop" className="btn btn-primary">Browse Available Products</Link>
      </div>
    </div>
  );

  const handleAdd = () => {
    actions.addToCart(product.id, qty);
    actions.toast(`${qty} ${product.unit}${qty > 1 ? 's' : ''} of ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    actions.addToCart(product.id, qty);
    navigate('/cart');
  };

  const related = state.products.filter(p => p.available && p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep"><ChevronRight size={14} /></span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-sep"><ChevronRight size={14} /></span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-detail-image-wrap">
            {product.image
              ? <img src={product.image} alt={product.name} className="product-detail-image" />
              : <div className="product-detail-image-placeholder">{product.emoji}</div>
            }
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="tag">{product.category}</span>
              <span className="badge badge-available">In Stock</span>
            </div>

            <h1 className="product-detail-name">{product.name}</h1>

            <p className="product-card-origin" style={{ fontSize: 14 }}>
              <MapPin size={14} /> {product.origin}
            </p>

            <div className="product-detail-price">
              ₹{product.pricePerKg.toLocaleString('en-IN')}
              <span> / {product.unit}</span>
            </div>

            <p className="product-detail-desc">{product.description}</p>

            <div className="divider" />

            <div className="qty-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quantity ({product.unit})
                </span>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Total: <strong style={{ color: 'var(--forest)', fontSize: 18 }}>₹{(product.pricePerKg * qty).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleAdd} style={{ flex: '1 1 140px' }}>
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button className="btn btn-amber" onClick={handleBuyNow} style={{ flex: '1 1 140px' }}>
                Buy Now →
              </button>
            </div>

            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '16px 20px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              🚚 Dispatched within 24 hours &nbsp;·&nbsp; 🌿 No preservatives &nbsp;·&nbsp; 📦 Packed fresh
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 24, color: 'var(--soil)' }}>
              More {product.category}
            </h2>
            <div className="product-grid">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="product-card">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="product-card-image" />
                    : <div className="product-card-image-placeholder">{p.emoji}</div>
                  }
                  <div className="product-card-body">
                    <h3 className="product-card-name">{p.name}</h3>
                    <div className="product-price">
                      <span className="product-price-amount">₹{p.pricePerKg.toLocaleString('en-IN')}</span>
                      <span className="product-price-unit">per {p.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
