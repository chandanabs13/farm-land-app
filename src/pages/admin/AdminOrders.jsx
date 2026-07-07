import { useState } from "react";
import { ChevronDown, ChevronUp, Phone, MapPin, Trash2 } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { customerName, customerLocation } from "../../utils/customer";

const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];
const statusColors = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

export default function AdminOrders() {
  const { state, actions } = useStore();
  const { token } = useAdminAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const filtered =
    filter === "all"
      ? state.orders
      : state.orders.filter((o) => o.status === filter);

  const handleStatusChange = async (order, status) => {
    try {
      await actions.updateOrderStatus(order.id, status, token);
      actions.toast(`Order ${order.id} marked as ${status}`);
      if (status === "delivered") {
        actions.toast("Order delivered — you can delete it when done", "success");
      }
    } catch {
      actions.toast("Could not update order status", "error");
    }
  };

  const handleDelete = async (order) => {
    const msg =
      order.status === "delivered"
        ? `Delete order ${order.id}? This will permanently remove it from your records.`
        : `Delete order ${order.id}? Only delete if cancelled or no longer needed.`;
    if (!window.confirm(msg)) return;

    setDeletingId(order.id);
    try {
      await actions.deleteOrder(order.id, token);
      actions.toast(`Order ${order.id} deleted`);
      if (expandedId === order.id) setExpandedId(null);
    } catch {
      actions.toast("Could not delete order", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (state.ordersLoading) {
    return (
      <div className="admin-page-header">
        <p className="admin-page-subtitle">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">
            {state.orders.length} total orders received
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
      >
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${
              filter === s ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && (
              <span style={{ marginLeft: 4 }}>
                ({state.orders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No orders yet</h3>
          <p className="empty-state-desc">
            Orders placed by customers will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((order) => (
            <div key={order.id} className="admin-table-wrap">
              {/* Order header row */}
              <div
                className="order-row-header"
                onClick={() =>
                  setExpandedId(expandedId === order.id ? null : order.id)
                }
              >
                <div className="order-row-meta">
                  <span className="order-row-id">{order.id}</span>
                  <span style={{ fontWeight: 600 }}>{customerName(order.customer)}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--forest)" }}>
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="order-row-actions">
                  <select
                    className="form-select order-status-select"
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`order-status-badge order-status-badge-dup ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    title="Delete order (admin only)"
                    disabled={deletingId === order.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(order);
                    }}
                    style={{ padding: "6px 10px", color: "var(--error, #c62828)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                  {expandedId === order.id ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === order.id && (
                <div className="order-detail-grid">
                  {/* Customer info */}
                  <div>
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        marginBottom: 14,
                      }}
                    >
                      Customer Details
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        fontSize: 14,
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Phone size={14} color="var(--moss)" />
                        {order.customer.phone}
                      </div>
                      {order.customer.email && (
                        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                          {order.customer.email}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                        }}
                      >
                        <MapPin
                          size={14}
                          color="var(--moss)"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <span>{customerLocation(order.customer)}</span>
                      </div>
                      {order.customer.notes && (
                        <div
                          style={{
                            background: "var(--cream)",
                            borderRadius: 8,
                            padding: "10px 14px",
                            fontSize: 13,
                            color: "var(--text-muted)",
                            marginTop: 4,
                          }}
                        >
                          📝 {order.customer.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-muted)",
                        marginBottom: 14,
                      }}
                    >
                      Order Items
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 14,
                            paddingBottom: 8,
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <span>
                            {item.name} × {item.qty} {item.unit}
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            ₹{item.total.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 13,
                          color: "var(--text-muted)",
                        }}
                      >
                        <span>Shipping</span>
                        <span>
                          {order.shipping === 0 ? "FREE" : `₹${order.shipping}`}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 700,
                          fontSize: 16,
                          marginTop: 4,
                        }}
                      >
                        <span>Total</span>
                        <span style={{ color: "var(--forest)" }}>
                          ₹{order.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
