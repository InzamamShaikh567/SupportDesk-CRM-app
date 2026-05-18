import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TeamTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateTicketId, setEscalateTicketId] = useState(null);
  const [tls, setTls] = useState([]);
  const [selectedTlId, setSelectedTlId] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchTLs();
  }, [statusFilter, priorityFilter, search]);

  const fetchTLs = async () => {
    try {
      const response = await api.get('/users/tls');
      setTls(response.data);
    } catch (err) {
      console.error('Failed to fetch TLs', err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets/team');
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
      'ASSIGNED': 'badge-open',
      'IN_PROGRESS': 'badge-progress',
      'RESOLVED': 'badge-resolved',
      'CLOSED': 'badge-closed',
      'ESCALATED': 'badge-escalated'
    };
    return statusMap[status] || 'badge-open';
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/tickets/${id}/resolve`);
      fetchTickets();
    } catch (err) {
      console.error('Failed to resolve ticket', err);
    }
  };

  const openEscalateModal = (id) => {
    setEscalateTicketId(id);
    setSelectedTlId('');
    setShowEscalateModal(true);
  };

  const handleEscalate = async () => {
    if (!escalateTicketId || !selectedTlId) return;
    try {
      await api.patch(`/tickets/${escalateTicketId}/escalate`, { targetTlId: parseInt(selectedTlId) });
      setShowEscalateModal(false);
      fetchTickets();
    } catch (err) {
      console.error('Failed to escalate ticket', err);
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
    <Layout title="Team Tickets" navItems={navItems}>
      <div className="tickets-toolbar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Search team tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tickets-filters">
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="ESCALATED">Escalated</option>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center" style={{ padding: 'var(--space-8)' }}>Loading...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No tickets found</td></tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="font-mono text-xs text-muted">{ticket.ticket_number}</td>
                  <td style={{ fontWeight: 500 }}>{ticket.subject}</td>
                  <td><span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></td>
                  <td><span className={`priority-dot ${ticket.priority}`}></span>{ticket.priority}</td>
                  <td className="text-muted text-xs">{new Date(ticket.updated_at).toLocaleString()}</td>
                  <td>
                    {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-sm btn-primary" onClick={() => handleResolve(ticket.id)}>Resolve</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEscalateModal(ticket.id)}>Escalate</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-info">Showing {tickets.length} tickets</div>
      </div>

      {showEscalateModal && (
        <div className="modal-overlay active" onClick={() => setShowEscalateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 'var(--space-6)', maxWidth: 400, width: '90%' }}>
            <h3 className="modal-title" style={{ marginBottom: 'var(--space-4)' }}>Escalate Ticket</h3>
            <p style={{ marginBottom: 'var(--space-4)', color: 'var(--muted)' }}>Select a Team Lead to assign this ticket to:</p>
            <div className="form-group">
              {tls.length === 0 ? (
                <p style={{ color: 'var(--danger)' }}>No Team Leads available to escalate to</p>
              ) : (
                <select
                  className="form-select"
                  value={selectedTlId}
                  onChange={(e) => setSelectedTlId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select Team Lead</option>
                  {tls.map((tl) => (
                    <option key={tl.id} value={tl.id}>
                      {tl.firstName} {tl.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-secondary" onClick={() => setShowEscalateModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEscalate} disabled={!selectedTlId}>Escalate</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TeamTickets;