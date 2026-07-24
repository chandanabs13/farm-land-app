import { Link } from 'react-router-dom';
import { MapPin, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductPrice from './ProductPrice';

export default function ProductCard({ product }) {
  const { actions } = useStore();

  const handleAdd = (e) => {
    e.preventDefault();
    actions.addToCart(product.id, 1);
    actions.toast(`${product.name} added to cart`);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {product.image
        ? <img src={product.image} alt={product.name} className="product-card-image" />
        : <div className="product-card-image-placeholder">{product.emoji}</div>
      }
      <div className="product-card-body">
        <div className="product-card-tags">
          <span className="tag">{product.category}</span>
        </div>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-origin">
          <MapPin size={12} /> {product.origin}
        </p>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <ProductPrice product={product} />
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </Link>
  );
}
