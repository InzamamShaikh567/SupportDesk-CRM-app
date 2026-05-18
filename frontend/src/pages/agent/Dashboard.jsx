import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my');
        setTickets(response.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch tickets', err);
      }
    };
    fetchTickets();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': 'badge-open',
      'IN_PROGRESS': 'badge-progress',
      'RESOLVED': 'badge-resolved',
      'CLOSED': 'badge-closed'
    };
    return statusMap[status] || 'badge-open';
  };

  const navItems = [
    {
      label: 'Main',
      items: [
        { path: '/agent/dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
        { path: '/agent/create-ticket', label: 'Create Ticket', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg> },
        { path: '/agent/my-tickets', label: 'My Tickets', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
      ]
    },
    {
      label: 'Account',
      items: [
        { path: '/agent/profile', label: 'Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg> },
      ]
    }
  ];

  const actions = (
    <button className="btn btn-primary" onClick={() => navigate('/agent/create-ticket')}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M12 5v14M5 12h14" /></svg>
      New Ticket
    </button>
  );

  return (
    <Layout title="Dashboard" actions={actions} navItems={navItems}>
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Tickets</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/agent/my-tickets')}>View all</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="font-mono text-xs text-muted">{ticket.ticket_number}</td>
                  <td style={{ fontWeight: 500 }}>{ticket.subject}</td>
                  <td><span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></td>
                  <td>
                    <span className={`priority-dot ${ticket.priority}`}></span>
                    {ticket.priority}
                  </td>
                  <td className="text-muted text-xs">{new Date(ticket.updated_at).toLocaleString()}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-muted text-center" style={{ padding: 'var(--space-8)' }}>No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
            <div className="quick-actions">
              <div className="quick-action" onClick={() => navigate('/agent/create-ticket')}>
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14" /></svg>
                </div>
                <span className="quick-action-text">New Ticket</span>
              </div>
              <div className="quick-action" onClick={() => navigate('/agent/my-tickets')}>
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                </div>
                <span className="quick-action-text">Search</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentDashboard;