import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { hasDiscount } from '../../utils/pricing';

export const SALE_SHOP_PATH = '/shop?sale=1';

const STORAGE_KEY = 'coorg_sale_popup_dismissed';

/** Hero sale strip — place inside `.hero-content` (replaces eyebrow when sale is on). */
export function SaleHeroBanner() {
  return (
    <Link to={SALE_SHOP_PATH} className="hero-sale-banner">
      <span className="hero-sale-live">Sale is live</span>
      <span className="hero-sale-copy">Book yours now before the sale ends</span>
    </Link>
  );
}

/** Full-screen sale popup — place once on the homepage. */
export function SalePopup() {
  const navigate = useNavigate();
  const { computed } = useStore();
  const [open, setOpen] = useState(false);

  const saleCount = computed.availableProducts.filter(hasDiscount).length;

  useEffect(() => {
    if (saleCount === 0) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [saleCount]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    setOpen(false);
  };

  const grabSale = () => {
    dismiss();
    navigate(SALE_SHOP_PATH);
  };

  if (!open || saleCount === 0) return null;

  return (
    <div
      className="sale-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sale-popup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="sale-popup">
        <button type="button" className="sale-popup-close" onClick={dismiss} aria-label="Dismiss">
          <X size={20} />
        </button>

        <button type="button" className="sale-popup-body" onClick={grabSale}>
          <span className="sale-popup-eyebrow">Limited time</span>
          <h2 id="sale-popup-title" className="sale-popup-title">
            Sale is live
          </h2>
          <p className="sale-popup-copy">
            Grab yours now before the sale ends. Shop discounted farm picks — wood-pressed coconut oil and more.
          </p>
          <span className="sale-popup-count">
            {saleCount} deal{saleCount !== 1 ? 's' : ''} waiting
          </span>
          <span className="btn btn-amber sale-popup-cta">Grab yours now →</span>
        </button>

        <button type="button" className="sale-popup-dismiss" onClick={dismiss}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
