import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">SD</div>
            <span>SupportDesk</span>
          </div>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ color: 'var(--success)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;