import { Link } from 'react-router-dom';
import { Leaf, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">Coorg Farms</div>
            <p className="footer-brand-desc">
              Nestled in the misty hills of Coorg and the gardens of Bangalore,
              our family farm brings you honest, unprocessed produce — grown with
              care, delivered with pride.
            </p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <MapPin size={14} /> Coorg Estate, Kodagu District, Karnataka
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <MapPin size={14} /> Guava Orchard, Bangalore Rural, Karnataka
              </div>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/about">Our Farm</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Products</div>
            <ul className="footer-links">
              <li><Link to="/shop?cat=Coffee">Arabica Coffee</Link></li>
              <li><Link to="/shop?cat=Pepper">Black Pepper</Link></li>
              <li><Link to="/shop?cat=Ghee">Desi Ghee</Link></li>
              <li><Link to="/shop?cat=Honey">Wild Honey</Link></li>
              <li><Link to="/shop?cat=Fruits">Fresh Fruits</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Coorg Farms. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Leaf size={13} /> Grown with love, delivered with care
          </span>
        </div>
      </div>
    </footer>
  );
}
