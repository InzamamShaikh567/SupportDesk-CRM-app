import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ open: 0, escalated: 0, resolved: 0, tls: 0, agents: 0 });
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, usersRes, teamsRes] = await Promise.all([
        api.get('/tickets/all'),
        api.get('/users'),
        api.get('/teams')
      ]);

      const tickets = ticketsRes.data;
      const users = usersRes.data;

      const open = tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length;
      const escalated = tickets.filter(t => t.status === 'ESCALATED').length;
      const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
      const tls = users.filter(u => u.role === 'TL' && u.isActive).length;
      const agents = users.filter(u => u.role === 'AGENT' && u.isActive).length;

      setStats({ open, escalated, resolved, tls, agents });
      setTeams(teamsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const navItems = [
    {
      label: 'Administration',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
        { path: '/admin/users', label: 'Users', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
        { path: '/admin/tickets', label: 'Tickets', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
        { path: '/admin/analytics', label: 'Analytics', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
      ]
    },
    {
      label: 'Account',
      items: [
        { path: '/admin/profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg> },
      ]
    }
  ];

  return (
    <Layout title="System Dashboard" navItems={navItems}>
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.open}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.escalated}</div>
          <div className="stat-label">Escalated Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.resolved}</div>
          <div className="stat-label">Resolved Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.tls}</div>
          <div className="stat-label">Active TLs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.agents}</div>
          <div className="stat-label">Active Agents</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Team Overview</h3>
        <div className="stats-grid">
          {teams.map((team) => (
            <div key={team.id} className="admin-stat" style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
              <div className="admin-stat-value" style={{ color: 'var(--accent)' }}>{team.name}</div>
              <div className="admin-stat-label">TL: {team.tlName || 'Unassigned'}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;