import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { usePageMeta } from "../../hooks/usePageMeta";

// Defined OUTSIDE CheckoutPage so it's not re-created on every render —
// that's what was causing the input to lose focus after each keystroke.
function Field({ label, error, ...inputProps }) {
  return (
    <div className="form-group">
      <label className="form-label">{label} *</label>
      <input className="form-input" {...inputProps} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function CheckoutPage() {
  const { state, computed, actions } = useStore();
  const navigate = useNavigate();
  usePageMeta({ title: 'Checkout', noIndex: true });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
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

  const shipping = computed.cartTotal >= 1000 ? 0 : 99;
  const grandTotal = computed.cartTotal + shipping;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.phone.length < 10) e.phone = "Valid phone required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (form.pincode.length < 6) e.pincode = "Valid pincode required";
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
      shipping,
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
            <h2 className="card-title">Delivery Details</h2>
            <div className="form-section">
              <div className="form-row">
                <Field
                  label="First Name"
                  placeholder="Ravi"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  error={errors.firstName}
                />
                <Field
                  label="Last Name"
                  placeholder="Kumar"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  error={errors.lastName}
                />
              </div>
              <div className="form-row">
                <Field
                  label="Email"
                  placeholder="ravi@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errors.email}
                />
                <Field
                  label="Phone"
                  placeholder="9876543210"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  error={errors.phone}
                />
              </div>
              <Field
                label="Address"
                placeholder="123, 4th Main, Indiranagar"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                error={errors.address}
              />
              <div className="form-row">
                <Field
                  label="City"
                  placeholder="Bangalore"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  error={errors.city}
                />
                <Field
                  label="State"
                  placeholder="Karnataka"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  error={errors.state}
                />
              </div>
              <Field
                label="Pincode"
                placeholder="560038"
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value)}
                error={errors.pincode}
              />
              <div className="form-group">
                <label className="form-label">Order Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Any special instructions for delivery..."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                padding: "16px 20px",
                background: "var(--cream)",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}
            >
              💳 <strong>Payment on delivery.</strong> We accept cash and UPI at
              your doorstep. You'll receive a call to confirm your order before
              dispatch.
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
                    <span className="order-summary-item-price">
                      ₹{(product.pricePerKg * qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  margin: "12px 0",
                }}
              >
                <div className="total-row">
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    Subtotal
                  </span>
                  <span>₹{computed.cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="total-row">
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    Shipping
                  </span>
                  <span
                    style={{
                      color: shipping === 0 ? "var(--success)" : "inherit",
                    }}
                  >
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
              </div>
              <div className="divider" />
              <div className="total-row" style={{ margin: "12px 0 24px" }}>
                <span className="total-label">Grand Total</span>
                <span className="total-value">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Placing order..." : "Place Order →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
