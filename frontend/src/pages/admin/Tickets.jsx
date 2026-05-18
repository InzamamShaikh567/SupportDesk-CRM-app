import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tls, setTls] = useState([]);

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      let response = await api.get(`/tickets/all?${params}`);
      let filtered = response.data;
      if (search) {
        filtered = filtered.filter(t =>
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
          (t.creator_first_name + ' ' + t.creator_last_name).toLowerCase().includes(search.toLowerCase())
        );
      }
      setTickets(filtered);

      const tlsRes = await api.get('/users/tls');
      setTls(tlsRes.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = { 'OPEN': 'badge-open', 'ASSIGNED': 'badge-open', 'IN_PROGRESS': 'badge-progress', 'RESOLVED': 'badge-resolved', 'CLOSED': 'badge-closed', 'ESCALATED': 'badge-escalated', 'REOPENED': 'badge-reopened', 'REJECTED': 'badge-rejected' };
    return statusMap[status] || 'badge-open';
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const tlId = e.target.tlId.value;
    try {
      await api.patch(`/tickets/${selectedTicket.id}/assign`, { tlId: parseInt(tlId) });
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to assign ticket', err);
    }
  };

  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
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
    <Layout title="All Tickets" navItems={navItems}>
      <div className="tickets-toolbar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input type="text" placeholder="Search all tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tickets-filters">
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
            <option value="REJECTED">Rejected</option>
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
              <th>Created By (Agent)</th>
              <th>Assigned To (TL)</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center" style={{ padding: 'var(--space-8)' }}>Loading...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No tickets found</td></tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="font-mono text-xs text-muted">{ticket.ticket_number}</td>
                  <td style={{ fontWeight: 500 }}>{ticket.subject}</td>
                  <td>{ticket.creator_first_name} {ticket.creator_last_name}</td>
                  <td>{ticket.tl_first_name ? `${ticket.tl_first_name} ${ticket.tl_last_name}` : '-'}</td>
                  <td><span className={`badge ${getStatusBadge(ticket.status)}`}>{ticket.status}</span></td>
                  <td><span className={`priority-dot ${ticket.priority}`}></span>{ticket.priority}</td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => openAssignModal(ticket)}>Assign</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${showAssignModal ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && setShowAssignModal(false)}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Assign Ticket</h2>
            <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
          </div>
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label className="form-label">Select Team Lead</label>
              <select className="form-select" name="tlId" required>
                <option value="">Select TL</option>
                {tls.map((tl) => <option key={tl.id} value={tl.id}>{tl.firstName} {tl.lastName}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Assign</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminTickets;