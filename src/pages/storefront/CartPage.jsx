import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function CartPage() {
  const { state, computed, actions } = useStore();
  const navigate = useNavigate();

  const cartItems = state.cart.map(item => ({
    ...item,
    product: state.products.find(p => p.id === item.productId),
  })).filter(i => i.product);

  if (cartItems.length === 0) return (
    <div className="container section">
      <div className="empty-state">
        <div className="empty-state-icon"><ShoppingBag size={56} color="var(--border)" /></div>
        <h3 className="empty-state-title">Your cart is empty</h3>
        <p className="empty-state-desc">Add some farm-fresh produce and we'll have it on its way to you.</p>
        <Link to="/shop" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  const shipping = computed.cartTotal >= 1000 ? 0 : 99;
  const grandTotal = computed.cartTotal + shipping;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--soil)', marginBottom: 32 }}>
          Your Cart
        </h1>

        <div className="checkout-grid">
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cartItems.map(({ product, qty, productId }) => (
              <div key={productId} style={{
                display: 'flex', gap: 16, background: '#fff', borderRadius: 'var(--radius-md)',
                padding: 20, border: '1px solid var(--border)', alignItems: 'center'
              }}>
                <Link to={`/product/${product.id}`}>
                  {product.image
                    ? <img src={product.image} alt={product.name} style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', background: 'var(--cream)' }} />
                    : <div style={{ width: 80, height: 80, borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{product.emoji}</div>
                  }
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${product.id}`}>
                    <h3 style={{ fontWeight: 600, marginBottom: 4, color: 'var(--soil)' }}>{product.name}</h3>
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>₹{product.pricePerKg.toLocaleString('en-IN')} per {product.unit}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => actions.updateCartQty(productId, qty - 1)}>−</button>
                      <span className="qty-val">{qty}</span>
                      <button className="qty-btn" onClick={() => actions.updateCartQty(productId, qty + 1)}>+</button>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => actions.removeFromCart(productId)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--forest)' }}>
                    ₹{(product.pricePerKg * qty).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 20px)' }}>
            <div className="order-summary-card">
              <h2 className="card-title">Order Summary</h2>
              <div className="order-summary-items">
                {cartItems.map(({ product, qty, productId }) => (
                  <div key={productId} className="order-summary-item">
                    <span className="order-summary-item-name">{product.name} × {qty}</span>
                    <span className="order-summary-item-price">₹{(product.pricePerKg * qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
                <div className="total-row">
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{computed.cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--moss)' }}>Add ₹{(1000 - computed.cartTotal).toLocaleString('en-IN')} more for free shipping</p>
                )}
              </div>
              <div className="divider" />
              <div className="total-row" style={{ margin: '12px 0 20px' }}>
                <span className="total-label">Total</span>
                <span className="total-value">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
