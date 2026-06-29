import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/shared/Navbar';

const NAV_ITEMS = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
];

export default function AdminLayout() {
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
        </aside>

        {/* Main content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
