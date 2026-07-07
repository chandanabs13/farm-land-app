import { Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { customerName } from '../../utils/customer';

export default function AdminDashboard() {
  const { state, computed } = useStore();

  const totalRevenue = state.orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  const recentOrders = state.orders.slice(0, 5);

  const stats = [
    { icon: <Package size={20} />, label: 'Total Products', value: state.products.length, bg: '#E8F5E9', color: '#2E7D32' },
    { icon: <Package size={20} />, label: 'Available', value: computed.availableProducts.length, bg: '#E3F2FD', color: '#1565C0' },
    { icon: <ShoppingBag size={20} />, label: 'Total Orders', value: state.orders.length, bg: '#FFF3E0', color: '#E65100' },
    { icon: <Clock size={20} />, label: 'Pending', value: pendingOrders, bg: '#FCE4EC', color: '#B71C1C' },
    { icon: <TrendingUp size={20} />, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, bg: '#F3E5F5', color: '#6A1B9A' },
  ];

  const statusColor = { pending: 'status-pending', confirmed: 'status-confirmed', delivered: 'status-delivered', cancelled: 'status-cancelled' };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here's what's happening on your farm store.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">Recent Orders</span>
        </div>
        {recentOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-state-icon">📋</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No orders yet. They'll appear here once customers place orders.</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{order.id}</td>
                  <td>{customerName(order.customer)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.total.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`order-status-badge ${statusColor[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
