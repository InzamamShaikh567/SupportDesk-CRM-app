import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets/my');
      let filtered = response.data;

      if (statusFilter) {
        filtered = filtered.filter(t => t.status === statusFilter);
      }
      if (priorityFilter) {
        filtered = filtered.filter(t => t.priority === priorityFilter);
      }
      if (search) {
        filtered = filtered.filter(t =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.ticket_number.toLowerCase().includes(search.toLowerCase())
        );
      }

      setTickets(filtered);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': 'badge-open',
      'IN_PROGRESS': 'badge-progress',
      'RESOLVED': 'badge-resolved',
      'CLOSED': 'badge-closed',
      'ESCALATED': 'badge-escalated',
      'REOPENED': 'badge-reopened',
      'REJECTED': 'badge-rejected'
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
    <Layout title="My Tickets" actions={actions} navItems={navItems}>
      <div className="tickets-toolbar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tickets-filters">
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
            {loading ? (
              <tr><td colSpan="5" className="text-center" style={{ padding: 'var(--space-8)' }}>Loading...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No tickets found</td></tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="font-mono text-xs text-muted">{ticket.ticket_number}</td>
                  <td style={{ fontWeight: 500, cursor: 'pointer' }}>{ticket.subject}</td>
                  <td><span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></td>
                  <td><span className={`priority-dot ${ticket.priority}`}></span>{ticket.priority}</td>
                  <td className="text-muted text-xs">{new Date(ticket.updated_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-info">Showing {tickets.length} tickets</div>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>←</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn" disabled>→</button>
        </div>
      </div>
    </Layout>
  );
};

export default MyTickets;