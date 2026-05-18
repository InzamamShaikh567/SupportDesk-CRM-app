import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, title, actions, navItems }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'AGENT': return 'Support Agent';
      case 'TL': return 'Team Lead';
      case 'ADMIN': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">SD</div>
            <span>SupportDesk</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((section, idx) => (
            <div className="sidebar-section" key={idx}>
              <div className="sidebar-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  end={item.path === '/'}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-menu" onClick={() => navigate('profile')}>
            <div className="user-avatar">{getInitials(user?.firstName, user?.lastName)}</div>
            <div className="user-info">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{getRoleLabel(user?.role)}</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 'var(--space-2)', width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">{title}</h1>
          <div className="page-actions">{actions}</div>
        </header>
        <div className="page-body">{children}</div>
      </main>
    </div>
  );
};

export default Layout;