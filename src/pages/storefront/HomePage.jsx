import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Truck, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from '../../components/storefront/ProductCard';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function HomePage() {
  const { computed, state } = useStore();
  usePageMeta({
    description: 'Farm-fresh coffee, pepper, ghee, honey and fruits from Coorg and Bangalore. Grown by our family, delivered to your home.',
  });

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow"><Leaf size={12} /> Two farms. One family.</div>
            <h1>
              Real food from<br />
              <em>Coorg's hills</em> to<br />
              your home
            </h1>
            <p className="hero-desc">
              Coffee, pepper, ghee, honey from our Coorg estate. Guava, jackfruit,
              coconut, and chikoo from our Bangalore farm. Grown by us — sold by us.
              No middlemen, no compromises.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-amber">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
                Our Story
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">2</div>
                <div className="hero-stat-label">Farm Locations</div>
              </div>
              <div>
                <div className="hero-stat-value">{state.products.filter(p => p.available).length}+</div>
                <div className="hero-stat-label">Products Available</div>
              </div>
              <div>
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Natural & Pure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Why choose us</div>
            <h2 className="section-title">The farm difference</h2>
            <p className="section-subtitle">We are the farmers. You are the family. There's nothing in between.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28 }}>
            {[
              { icon: <Leaf size={22} />, title: 'Farm to Home', desc: 'Grown on our own land in Coorg and Bangalore — picked, packed, and sent directly to you.' },
              { icon: <Shield size={22} />, title: 'No Additives', desc: 'No preservatives, no artificial flavours, no colours. Just the real thing, as nature intended.' },
              { icon: <Truck size={22} />, title: 'Fresh Dispatch', desc: 'Orders packed the same day and dispatched within 24 hours. Temperature-safe packaging for ghee and honey.' },
              { icon: <Star size={22} />, title: 'Seasonal Honesty', desc: 'Seasonal products like jackfruit are shown only when in season. No false listings, no stale stock.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: 28, border: '1px solid var(--border)' }}>
                <div style={{ width: 48, height: 48, background: 'var(--cream)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', marginBottom: 16 }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--soil)' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {computed.featuredProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div className="section-eyebrow">Bestsellers</div>
              <h2 className="section-title">Our <em>finest</em> picks</h2>
              <p className="section-subtitle">The products our customers keep coming back for.</p>
            </div>
            <div className="product-grid">
              {computed.featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/shop" className="btn btn-primary">
                View All Products <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* From the farms */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {[
              {
                emoji: '🌿',
                title: 'Coorg Estate',
                subtitle: 'Kodagu District, Karnataka • 1100m altitude',
                desc: 'Coffee and pepper vines share space with wild cardamom and native forest birds. The Coorg mist, the altitude, and the volcanic soil — they all show up in the cup.',
                items: ['Arabica Coffee', 'Black Pepper', 'A2 Desi Ghee', 'Wild Forest Honey'],
              },
              {
                emoji: '🌳',
                title: 'Bangalore Farm',
                subtitle: 'Bangalore Rural District, Karnataka',
                desc: 'A working orchard just outside the city. No chemicals, no shortcuts. The trees grow on their own schedule — and so do the harvests.',
                items: ['Guava', 'Jackfruit (seasonal)', 'Chikoo', 'Coconut'],
              },
            ].map(farm => (
              <div key={farm.title} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 36, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>{farm.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--soil)', marginBottom: 4 }}>{farm.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--moss)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>{farm.subtitle}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{farm.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {farm.items.map(item => <span key={item} className="tag">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
