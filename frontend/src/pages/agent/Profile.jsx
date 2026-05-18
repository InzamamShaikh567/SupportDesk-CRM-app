import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AgentProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.patch(`/users/${user.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      setMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.post(`/users/${user.id}/reset-password`, { 
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword 
      });
      setMessage('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Profile Settings" navItems={navItems}>
      <form onSubmit={handleSave}>
        <div className="profile-grid">
          <div>
            <div className="card profile-card">
              <div className="profile-avatar-large">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
              <div className="profile-name">{user?.firstName} {user?.lastName}</div>
              <div className="profile-role">Support Agent</div>
              <button type="button" className="btn btn-secondary btn-sm">Change Photo</button>

              <div className="profile-meta">
                <div className="profile-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {user?.email}
                </div>
                <div className="profile-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  {user?.teamName || 'No team'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="profile-section">
                <h3 className="profile-section-title">Personal Information</h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" className="form-input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" className="form-input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input type="email" id="email" className="form-input" value={formData.email} disabled />
                </div>
              </div>

              {message && <div style={{ color: 'var(--success)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{message}</div>}
              {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{error}</div>}

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>Save Changes</button>
                <button type="button" className="btn btn-secondary">Cancel</button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 'var(--space-4)' }}>
              <div className="profile-section">
                <h3 className="profile-section-title">Change Password</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="currentPassword">Current Password</label>
                  <input type="password" id="currentPassword" className="form-input" placeholder="Enter current password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="newPassword">New Password</label>
                    <input type="password" id="newPassword" className="form-input" placeholder="Enter new password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" className="form-input" placeholder="Confirm new password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                  </div>
                </div>
                <button type="button" className="btn btn-secondary" onClick={handlePasswordChange}>Update Password</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default AgentProfile;