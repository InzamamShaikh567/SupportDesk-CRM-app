import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: '',
    customerEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/tickets', formData);
      navigate('/agent/my-tickets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Create New Ticket" navItems={navItems}>
      <form className="ticket-form" onSubmit={handleSubmit}>
        <div>
          <div className="card">
            {error && (
              <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                className="form-input"
                placeholder="Brief summary of the issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Provide detailed information about the issue, including steps to reproduce if applicable..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <select
                  id="category"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerEmail">Customer Email *</label>
              <input
                type="email"
                id="customerEmail"
                className="form-input"
                placeholder="customer@company.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/agent/dashboard')}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="sidebar-tip">
            <h4>Tips for faster resolution</h4>
            <p>Include specific error messages and steps to reproduce the issue. This helps our team resolve your ticket faster.</p>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default CreateTicket;