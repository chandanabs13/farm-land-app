import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { usePageMeta } from "../../hooks/usePageMeta";
import SearchSelect from "../../components/storefront/SearchSelect";
import { TOWERS, FLATS, HOME_DELIVERY_FEE } from "../../data/communityUnits";

function Field({ label, error, optional, ...inputProps }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {optional ? " (optional)" : " *"}
      </label>
      <input className="form-input" {...inputProps} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function CheckoutPage() {
  const { state, computed, actions } = useStore();
  const navigate = useNavigate();
  usePageMeta({ title: "Checkout", noIndex: true });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    tower: "",
    flat: "",
    deliveryType: "pickup",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const cartItems = state.cart
    .map((item) => ({
      ...item,
      product: state.products.find((p) => p.id === item.productId),
    }))
    .filter((i) => i.product);

  const deliveryFee = form.deliveryType === "home" ? HOME_DELIVERY_FEE : 0;
  const grandTotal = computed.cartTotal + deliveryFee;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Valid phone required";
    if (!form.tower) e.tower = "Select your tower";
    if (!form.flat) e.flat = "Select your flat";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const order = {
      customer: form,
      items: cartItems.map(({ product, qty }) => ({
        productId: product.id,
        name: product.name,
        pricePerKg: product.pricePerKg,
        unit: product.unit,
        qty,
        total: product.pricePerKg * qty,
      })),
      subtotal: computed.cartTotal,
      shipping: deliveryFee,
      total: grandTotal,
    };
    try {
      await actions.placeOrder(order);
      navigate("/order-success");
    } catch {
      actions.toast("Could not place order. Please try again.", "error");
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3 className="empty-state-title">Nothing to checkout</h3>
          <Link to="/shop" className="btn btn-primary">
            Go to Shop
          </Link>
        </div>
      </div>
    );

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-grid">
          <div className="checkout-form-card">
            <h2 className="card-title">Your details</h2>
            <p className="checkout-community-note">Community orders only — we deliver within our apartment complex.</p>

            <div className="form-section">
              <Field label="Name" placeholder="Your full name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
              <Field label="Phone" placeholder="9876543210" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />

              <div className="form-row">
                <SearchSelect label="Tower" placeholder="Type tower number…" options={TOWERS} value={form.tower} onChange={(v) => set("tower", v)} error={errors.tower} />
                <SearchSelect label="Flat" placeholder="Type flat number…" options={FLATS} value={form.flat} onChange={(v) => set("flat", v)} error={errors.flat} />
              </div>

              <div className="form-group">
                <label className="form-label">How do you want your order? *</label>
                <div className="delivery-options">
                  <label className={`delivery-option${form.deliveryType === "pickup" ? " selected" : ""}`}>
                    <input type="radio" name="deliveryType" value="pickup" checked={form.deliveryType === "pickup"} onChange={() => set("deliveryType", "pickup")} />
                    <span>
                      <strong>Pickup at Tower-1, 601</strong>
                      <small>Free — collect at Tower 1,601</small>
                    </span>
                  </label>
                  <label className={`delivery-option${form.deliveryType === "home" ? " selected" : ""}`}>
                    <input type="radio" name="deliveryType" value="home" checked={form.deliveryType === "home"} onChange={() => set("deliveryType", "home")} />
                    <span>
                      <strong>Home delivery to flat</strong>
                      <small>
                        +₹{HOME_DELIVERY_FEE} — delivered to Flat {form.flat || "…"}
                      </small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Order notes (optional)</label>
                <textarea className="form-textarea" rows={2} placeholder="Any special instructions…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>

            <div className="checkout-info-box">
              <strong>No COD.</strong> Pay when you collect your order at your tower lobby
              {form.tower && form.flat && (
                <>
                  {" "}
                  (e.g. Tower {form.tower}, Flat {form.flat})
                </>
              )}
              . Need it at your door? Choose home delivery for ₹{HOME_DELIVERY_FEE} extra.
            </div>
          </div>

          <div className="sticky-summary">
            <div className="order-summary-card">
              <h2 className="card-title">Order Summary</h2>
              <div className="order-summary-items">
                {cartItems.map(({ product, qty }) => (
                  <div key={product.id} className="order-summary-item">
                    <span className="order-summary-item-name">
                      {product.name} × {qty} {product.unit}
                    </span>
                    <span className="order-summary-item-price">₹{(product.pricePerKg * qty).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="order-summary-totals">
                <div className="total-row">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{computed.cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="total-row">
                  <span className="text-muted">{form.deliveryType === "home" ? "Home delivery" : "Pickup"}</span>
                  <span className={deliveryFee === 0 ? "text-success" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
              </div>
              <div className="divider" />
              <div className="total-row summary-grand">
                <span className="total-label">Grand Total</span>
                <span className="total-value">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Placing order..." : "Place Order →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
