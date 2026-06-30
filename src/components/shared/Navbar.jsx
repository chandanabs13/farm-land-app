import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Navbar({ isAdmin }) {
  const { computed } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleCartClick = () => {
    if (isAdmin) return;
    navigate('/cart');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to={isAdmin ? '/admin' : '/'} className="nav-brand">
          <div className="nav-brand-icon">
            <Leaf size={18} color="#fff" />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-name">Coorg Farms</span>
            <span className="nav-brand-sub">
              {isAdmin ? 'Admin Panel' : 'Farm Fresh Delivered'}
            </span>
          </div>
        </Link>

        {!isAdmin && (
          <>
            <ul className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
              <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
              <li><NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink></li>
              <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>Our Farm</NavLink></li>
            </ul>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="nav-cart-btn" onClick={handleCartClick} aria-label="View cart">
                <ShoppingCart size={18} />
                <span>Cart</span>
                {computed.cartCount > 0 && (
                  <span className="cart-count">{computed.cartCount}</span>
                )}
              </button>
              <button className="mobile-menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </>
        )}

        {isAdmin && (
          <Link to="/" className="btn btn-secondary btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            ← View Store
          </Link>
        )}
      </div>
    </nav>
  );
}
