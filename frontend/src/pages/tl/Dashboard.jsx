import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TLDashboard = () => {
  const [stats, setStats] = useState({ total: 0, open: 0, escalated: 0, resolved: 0 });
  const [escalations, setEscalations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamRes, escRes] = await Promise.all([
        api.get('/tickets/team'),
        api.get('/tickets/escalated')
      ]);

      const teamTickets = teamRes.data;
      setEscalations(escRes.data.slice(0, 3));

      const open = teamTickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length;
      const escalated = teamTickets.filter(t => t.status === 'ESCALATED').length;
      const resolved = teamTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

      setStats({
        total: teamTickets.length,
        open,
        escalated,
        resolved
      });
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const navItems = [
    {
      label: 'Team Lead',
      items: [
        { path: '/tl/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
        { path: '/tl/team-tickets', label: 'Team Tickets', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/></svg> },
        { path: '/tl/agents', label: 'Agents', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
        { path: '/tl/escalations', label: 'Escalations', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> },
      ]
    },
    {
      label: 'Account',
      items: [
        { path: '/tl/profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg> },
      ]
    }
  ];

  return (
    <Layout title="Team Dashboard" navItems={navItems}>
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Team Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.open}</div>
          <div className="stat-label">Open Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.escalated}</div>
          <div className="stat-label">Escalations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Escalations</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tl/escalations')}>View all</button>
        </div>
        {escalations.length === 0 ? (
          <div className="text-muted text-center" style={{ padding: 'var(--space-8)' }}>No escalations</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {escalations.map((esc) => (
              <div key={esc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', borderLeft: '3px solid var(--danger)', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 'var(--space-1)' }}>{esc.ticket_number} - {esc.subject}</div>
                  <div className="text-muted text-xs">Created by {esc.creator_first_name} {esc.creator_last_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/tl/team-tickets')}>View all team tickets</button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/tl/agents')}>Manage agents</button>
          <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => navigate('/tl/escalations')}>Review escalations</button>
        </div>
      </div>
    </Layout>
  );
};

export default TLDashboard;