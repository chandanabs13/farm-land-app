import { useEffect } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStore } from '../../context/StoreContext';
import { usePageMeta } from '../../hooks/usePageMeta';

const NAV_ITEMS = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
];

export default function AdminLayout() {
  const { isAuthed, logout, token } = useAdminAuth();
  const { actions } = useStore();
  const location = useLocation();
  usePageMeta({ title: 'Admin', noIndex: true });

  useEffect(() => {
    if (isAuthed && token) actions.fetchOrders(token);
  }, [isAuthed, token]);

  if (!isAuthed) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <>
      <Navbar isAdmin />

      {/* Mobile tab bar */}
      <div className="admin-mobile-nav" style={{ background: 'var(--soil)' }}>
        {NAV_ITEMS.map(({ to, icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              textDecoration: 'none',
            })}
          >
            {icon} {label}
          </NavLink>
        ))}
      </div>

      <div className="admin-layout">
        {/* Sidebar (desktop) */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Farm Admin</div>
          {NAV_ITEMS.map(({ to, icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              {icon} {label}
            </NavLink>
          ))}
          <div style={{ flex: 1 }} />
          <button
            className="admin-nav-item"
            onClick={logout}
            style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </aside>

        {/* Main content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
