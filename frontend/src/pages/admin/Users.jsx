import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('tls');
  const [tls, setTls] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'AGENT', teamId: '' });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tlsRes, agentsRes, teamsRes] = await Promise.all([
        api.get('/users/tls'),
        api.get('/users/agents'),
        api.get('/teams')
      ]);
      setTls(tlsRes.data);
      setAgents(agentsRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'AGENT', teamId: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeactivate = async (id) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (err) {
        console.error('Failed to deactivate user', err);
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/users/${id}/admin`, { isActive: true });
      fetchData();
    } catch (err) {
      console.error('Failed to activate user', err);
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

  const actions = (
    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M12 5v14M5 12h14" /></svg>
      Add User
    </button>
  );

  const currentUsers = activeTab === 'tls' ? tls : agents;

  return (
    <Layout title="User Management" actions={actions} navItems={navItems}>
      <div className="tabs">
        <div className={`tab ${activeTab === 'tls' ? 'active' : ''}`} onClick={() => setActiveTab('tls')}>Team Leads</div>
        <div className={`tab ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>Agents</div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Team</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center" style={{ padding: 'var(--space-8)' }}>Loading...</td></tr>
            ) : currentUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted" style={{ padding: 'var(--space-8)' }}>No users found</td></tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</div>
                    <div className="text-muted text-xs">{user.email}</div>
                  </td>
                  <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td>{user.teamName || '-'}</td>
                  <td><span className={`badge ${user.isActive ? 'badge-resolved' : 'badge-closed'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    {user.isActive ? (
                      <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDeactivate(user.id)}>Deactivate</button>
                    ) : (
                      <button className="btn btn-ghost btn-sm text-success" onClick={() => handleActivate(user.id)}>Activate</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
        <div className="modal">
          <div className="modal-header">
            <h2 className="modal-title">Add New User</h2>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
          </div>
          <form onSubmit={handleCreateUser}>
            <div className="form-grid-2">
              <div className="form-group"><label className="form-label">First Name *</label><input type="text" className="form-input" placeholder="First name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input type="text" className="form-input" placeholder="Last name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-input" placeholder="Enter email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">Password *</label><input type="password" className="form-input" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                <option value="AGENT">Support Agent</option>
                <option value="TL">Team Lead</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Team</label>
              <select className="form-select" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                <option value="">Select team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;