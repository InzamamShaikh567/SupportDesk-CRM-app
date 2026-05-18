import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const Escalations = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateTicketId, setEscalateTicketId] = useState(null);
  const [tls, setTls] = useState([]);
  const [selectedTlId, setSelectedTlId] = useState('');

  useEffect(() => {
    fetchEscalations();
    fetchTLs();
  }, []);

  const fetchTLs = async () => {
    try {
      const response = await api.get('/users/tls');
      setTls(response.data);
    } catch (err) {
      console.error('Failed to fetch TLs', err);
    }
  };

  useEffect(() => {
    if (tickets.length >= 0) {
      // Filter is applied in fetchEscalations
    }
  }, [priorityFilter, tickets.length]);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets/escalated');
      let filtered = response.data;

      if (priorityFilter) {
        filtered = filtered.filter(t => t.priority === priorityFilter);
      }

      setTickets(filtered);
    } catch (err) {
      console.error('Failed to fetch escalations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/tickets/${id}/resolve`);
      fetchEscalations();
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
      fetchEscalations();
    } catch (err) {
      console.error('Failed to escalate ticket', err);
    }
  };

  const highPriority = tickets.filter(t => t.priority === 'high').length;
  const mediumPriority = tickets.filter(t => t.priority === 'medium').length;

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
    <Layout title="Escalations Queue" navItems={navItems}>
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{highPriority}</div>
          <div className="stat-label">High Priority Escalations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warn)' }}>{mediumPriority}</div>
          <div className="stat-label">Medium Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tickets.length}</div>
          <div className="stat-label">Total Active</div>
        </div>
      </div>

      <div className="tickets-toolbar">
        <select className="form-select" style={{ width: 'auto' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
      </div>

      <div className="escalations-list">
        {loading ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No escalations</div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="card escalation-card">
              <div className="escalation-main">
                <div className="escalation-header">
                  <span className="escalation-id">{ticket.ticket_number}</span>
                  <span className={`escalation-badge ${ticket.priority === 'high' ? 'urgent' : 'warning'}`}>
                    {ticket.priority === 'high' ? 'High' : 'Medium'}
                  </span>
                </div>
                <h3 className="escalation-subject">{ticket.subject}</h3>
                <p className="escalation-description">{ticket.description}</p>
                <div className="escalation-meta">
                  <div className="escalation-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {ticket.creator_first_name} {ticket.creator_last_name}
                  </div>
                  <div className="escalation-meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Escalated {new Date(ticket.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="escalation-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleResolve(ticket.id)}>Resolve</button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEscalateModal(ticket.id)}>Escalate</button>
              </div>
            </div>
          ))
        )}
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

export default Escalations;