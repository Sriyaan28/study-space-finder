import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Settings,
  Eye,
  Shield,
} from 'lucide-react';

export const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `admin-nav-item ${isActive ? 'admin-nav-active' : ''}`;

  return (
    <aside className="admin-sidebar card">
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={16} color="#ffffff" />
        </div>
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Admin Console</h4>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Campus Resource Hub</span>
        </div>
      </div>

      <nav style={{ padding: '0.875rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard size={18} />
          <span>Dashboard Overview</span>
        </NavLink>

        <NavLink to="/admin/spaces" className={linkClass}>
          <Building2 size={18} />
          <span>Manage Spaces</span>
        </NavLink>

        <NavLink to="/admin/students" className={linkClass}>
          <Users size={18} />
          <span>Student Accounts</span>
        </NavLink>

        <NavLink to="/admin/reservations" className={linkClass}>
          <Calendar size={18} />
          <span>Campus Reservations</span>
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem 0.625rem', borderTop: '1px solid var(--border-subtle)' }}>
        <Link to="/spaces" className="admin-nav-item" style={{ color: 'var(--primary)' }}>
          <Eye size={18} />
          <span>View Student Catalog</span>
        </Link>
      </div>

      <style>{`
        .admin-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 120px);
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-md);
          transition: var(--transition);
        }
        .admin-nav-item:hover {
          background: #f8fafc;
          color: var(--text-main);
        }
        .admin-nav-active {
          background: var(--primary-light) !important;
          color: var(--primary) !important;
          font-weight: 700;
        }
        @media (max-width: 900px) {
          .admin-sidebar {
            width: 100%;
            min-height: auto;
            margin-bottom: 1.5rem;
          }
          .admin-sidebar nav {
            flex-direction: row;
            overflow-x: auto;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
