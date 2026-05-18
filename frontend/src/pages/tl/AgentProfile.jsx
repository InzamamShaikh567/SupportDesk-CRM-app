import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TLAgentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [agentRes, ticketsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get('/tickets/team')
      ]);
      setAgent(agentRes.data);
      const agentTickets = ticketsRes.data.filter(t => t.created_by === parseInt(id));
      setTickets(agentTickets);
    } catch (err) {
      console.error('Failed to fetch agent', err);
      setError(err.response?.data?.message || 'Failed to load agent');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    escalated: tickets.filter(t => t.status === 'ESCALATED').length
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

  if (loading) {
    return (
      <Layout title="Agent Profile" navItems={navItems}>
        <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Agent Profile" navItems={navItems}>
        <div className="text-center" style={{ padding: 'var(--space-8)' }}>
          <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)' }}>{error}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tl/agents')}>Back to Agents</button>
        </div>
      </Layout>
    );
  }

  if (!agent) {
    return (
      <Layout title="Agent Profile" navItems={navItems}>
        <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Agent not found</div>
      </Layout>
    );
  }

  return (
    <Layout title={`${agent.firstName} ${agent.lastName}`} navItems={navItems}>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tl/agents')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 4 }}><path d="M15 19l-7-7 7-7" /></svg>
          Back to Agents
        </button>
      </div>

      <div className="profile-grid">
        <div>
          <div className="card profile-card">
            <div className="profile-avatar-large">{agent.firstName?.[0]}{agent.lastName?.[0]}</div>
            <div className="profile-name">{agent.firstName} {agent.lastName}</div>
            <div className="profile-role">Support Agent</div>

            <div className="profile-meta">
              <div className="profile-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {agent.email}
              </div>
              <div className="profile-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {agent.teamName || 'No team'}
              </div>
              <div className="profile-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                Joined {new Date(agent.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Performance Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Tickets</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--warn)' }}>{stats.open}</div>
                <div className="stat-label">Open</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.inProgress}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.resolved}</div>
                <div className="stat-label">Resolved</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Recent Tickets</h3>
            {tickets.length === 0 ? (
              <div className="text-center text-muted" style={{ padding: 'var(--space-4)' }}>No tickets yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {tickets.slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="ticket-item" style={{ padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="font-mono text-xs text-muted">{ticket.ticket_number}</span>
                        <div style={{ fontWeight: 500 }}>{ticket.subject}</div>
                      </div>
                      <span className={`badge badge-${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'resolved' : ticket.status === 'ESCALATED' ? 'escalated' : 'open'}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TLAgentProfile;