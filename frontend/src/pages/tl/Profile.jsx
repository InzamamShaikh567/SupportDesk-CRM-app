import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TLProfile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
              <div className="profile-role">Team Lead</div>
              <div className="profile-meta">
                <div className="profile-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{user?.email}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="card">
              <div className="profile-section">
                <h3 className="profile-section-title">Personal Information</h3>
                <div className="form-grid-2">
                  <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={formData.email} disabled /></div>
              </div>
              {message && <div style={{ color: 'var(--success)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{message}</div>}
              {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}><button type="submit" className="btn btn-primary" disabled={loading}>Save Changes</button><button type="button" className="btn btn-secondary">Cancel</button></div>
            </div>
            <div className="card" style={{ marginTop: 'var(--space-4)' }}>
              <div className="profile-section">
                <h3 className="profile-section-title">Change Password</h3>
                <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} /></div>
                <div className="form-grid-2">
                  <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} /></div>
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

export default TLProfile;