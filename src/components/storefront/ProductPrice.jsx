import { getDiscountPercent } from '../../utils/pricing';

export default function ProductPrice({ product, size = 'card' }) {
  const sale = Number(product.pricePerKg);
  const original = Number(product.originalPrice);
  const pct = getDiscountPercent(sale, original);
  const onSale = pct > 0;

  if (size === 'detail') {
    return (
      <div className="product-detail-price-block">
        <div className="product-detail-price">
          ₹{sale.toLocaleString('en-IN')}
          <span> / {product.unit}</span>
        </div>
        {onSale && (
          <div className="product-price-sale-meta">
            <span className="product-price-mrp">₹{original.toLocaleString('en-IN')}</span>
            <span className="product-discount-badge">{pct}% OFF</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="product-price">
      <div className="product-price-row">
        <span className="product-price-amount">₹{sale.toLocaleString('en-IN')}</span>
        {onSale && <span className="product-discount-badge">{pct}% OFF</span>}
      </div>
      {onSale && (
        <span className="product-price-mrp">₹{original.toLocaleString('en-IN')}</span>
      )}
      <span className="product-price-unit">per {product.unit}</span>
    </div>
  );
}
