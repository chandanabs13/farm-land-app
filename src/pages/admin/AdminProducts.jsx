import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import ProductFormModal from "../../components/admin/ProductFormModal";
import { getDiscountPercent } from "../../utils/pricing";

export default function AdminProducts() {
  const { state, actions } = useStore();
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = new, product = edit
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = async (id) => {
    try {
      await actions.deleteProduct(id);
      actions.toast("Product deleted on all devices", "error");
      setDeleteConfirm(null);
    } catch (err) {
      actions.toast(err.message || "Could not delete product", "error");
    }
  };

  const handleToggle = async (p) => {
    try {
      await actions.toggleAvailability(p.id);
      actions.toast(p.available ? "Product hidden on all devices" : "Product now visible on all devices");
    } catch (err) {
      actions.toast(err.message || "Could not update product", "error");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            {state.products.length} total · {state.products.filter((p) => p.available).length} available
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalProduct(null)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="admin-table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Origin</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((p) => {
                const pct = getDiscountPercent(p.pricePerKg, p.originalPrice);
                return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {p.image ? <img src={p.image} alt={p.name} className="product-thumb" /> : <div className="product-thumb">{p.emoji}</div>}
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tag">{p.category}</span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{p.origin}</td>
                  <td style={{ fontWeight: 600 }}>
                    ₹{p.pricePerKg.toLocaleString("en-IN")}
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>/{p.unit}</span>
                    {pct > 0 && (
                      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--amber)", marginTop: 2 }}>
                        <span style={{ textDecoration: "line-through", color: "var(--text-muted)" }}>
                          ₹{Number(p.originalPrice).toLocaleString("en-IN")}
                        </span>
                        {" · "}{pct}% OFF
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.available ? "badge-available" : "badge-unavailable"}`}>{p.available ? "Available" : "Hidden"}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: p.featured ? "var(--amber)" : "var(--text-muted)" }}>{p.featured ? "⭐ Yes" : "—"}</span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-sm btn-secondary" title={p.available ? "Hide from store" : "Show in store"} onClick={() => handleToggle(p)}>
                        {p.available ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setModalProduct(p)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(p)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product form modal */}
      {modalProduct !== undefined && <ProductFormModal product={modalProduct} onClose={() => setModalProduct(undefined)} />}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Product?</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-muted)" }}>
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
