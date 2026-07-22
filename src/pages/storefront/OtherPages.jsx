import { Link } from "react-router-dom";
import { usePageMeta } from "../../hooks/usePageMeta";

export function OrderSuccessPage() {
  usePageMeta({ title: "Order Placed", noIndex: true });
  return (
    <div className="success-page container">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1 className="success-title">Order Placed!</h1>
        <p className="success-subtitle">
          Thank you! We&apos;ll call you to confirm. Collect your order at your tower lobby, or we&apos;ll deliver to your flat if you chose home delivery (+₹10).
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
        <p style={{ marginTop: 24, fontSize: 12, color: "var(--text-muted)" }}>Questions? Call or WhatsApp us directly.</p>
      </div>
    </div>
  );
}

export function AboutPage() {
  usePageMeta({
    title: "Our Farm",
    description: "Learn about our Coorg estate and Bangalore orchard — two farms, one family, real food with no middlemen.",
  });

  return (
    <div>
      <section className="hero" style={{ minHeight: 360 }}>
        <div className="container">
          <div className="hero-content" style={{ paddingTop: 60, paddingBottom: 60 }}>
            <div className="hero-eyebrow">🌿 Our story</div>
            <h1>
              Two farms.
              <br />
              <em>One family.</em>
            </h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 32 }}>
            We've been farming in Coorg for years — coffee, pepper, and the forest produce that grows alongside them naturally. The ghee comes from our own desi cows. The honey is
            collected from wild rock bee hives deep inside the estate.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 32 }}>
            In Bangalore, we tend a small orchard — guava, jackfruit, chikoo, and coconut. Everything has its season. Nothing is forced out of it.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "var(--text-muted)" }}>
            This store is our way of connecting directly with people who value real food. No distributor, no repackaging, no mystery. Just us, the farm, and you.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Our values</div>
            <h2 className="section-title">How we farm</h2>
          </div>
          <div className="feature-grid">
            {[
              { emoji: "🌱", title: "No Chemicals", desc: "We do not use synthetic pesticides or fertilisers on any of our produce." },
              { emoji: "🐄", title: "Desi Breeds", desc: "Our ghee is made from A2 milk from native Gir and Sahiwal cows, using the traditional bilona method." },
              { emoji: "🍯", title: "Wild Harvest", desc: "Honey is collected from wild rock bee hives without disturbing the colony — seasonal and limited." },
              // { emoji: '📦', title: 'Packed Fresh', desc: 'Every order is packed the day it ships. We do not hold inventory in warehouses.' },
            ].map((v) => (
              <div key={v.title} className="feature-card">
                <div className="farm-card-emoji" style={{ fontSize: 36 }}>
                  {v.emoji}
                </div>
                <h3 className="feature-card-title">{v.title}</h3>
                <p className="feature-card-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
