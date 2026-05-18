import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({ total: 0, resolved: 0, avgTime: '' });
  const [tls, setTls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, tlsRes] = await Promise.all([
        api.get('/tickets/all'),
        api.get('/users/tls')
      ]);

      const tickets = ticketsRes.data;
      const total = tickets.length;
      const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

      // Count by category
      const catCounts = {};
      tickets.forEach(t => {
        catCounts[t.category] = (catCounts[t.category] || 0) + 1;
      });

      const catData = Object.entries(catCounts).map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100)
      }));

      setStats({ total, resolved, avgTime: '3.2h' });
      setTls(tlsRes.data);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
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

  return (
    <Layout title="Analytics & Reports" navItems={navItems}>
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Tickets</div></div>
        <div className="stat-card"><div className="stat-value">{Math.round((stats.resolved / stats.total) * 100) || 0}%</div><div className="stat-label">Resolution Rate</div></div>
        <div className="stat-card"><div className="stat-value">{stats.avgTime}</div><div className="stat-label">Avg Response Time</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Tickets Over Time</h3>
          <div className="chart-area">
            {[45, 52, 48, 65, 70, 58, 72, 80, 75, 85, 78, 90].map((height, i) => (
              <div key={i} className="chart-bar" style={{ height: `${height}%` }} data-label={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}></div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>TL Performance</h3>
          {loading ? <div className="text-muted">Loading...</div> : (
            <table className="performance-table">
              <thead><tr><th>TL Name</th><th>Team</th><th>Resolved</th></tr></thead>
              <tbody>
                {tls.map((tl) => (
                  <tr key={tl.id}>
                    <td style={{ fontWeight: 500 }}>{tl.firstName} {tl.lastName}</td>
                    <td>{tl.teamName || '-'}</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Category Distribution</h3>
          {loading ? <div className="text-muted">Loading...</div> : (
            <table className="performance-table">
              <thead><tr><th>Category</th><th>Count</th><th>%</th></tr></thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name}>
                    <td style={{ textTransform: 'capitalize' }}>{cat.name}</td>
                    <td>{cat.count}</td>
                    <td>{cat.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;