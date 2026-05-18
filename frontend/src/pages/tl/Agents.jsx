import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const TLAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentStats, setAgentStats] = useState({});

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const [agentsRes, ticketsRes] = await Promise.all([
        api.get('/users/agents'),
        api.get('/tickets/team')
      ]);
      setAgents(agentsRes.data);

      const stats = {};
      ticketsRes.data.forEach(ticket => {
        const creatorId = ticket.created_by;
        if (!stats[creatorId]) {
          stats[creatorId] = { open: 0, resolved: 0 };
        }
        if (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') {
          stats[creatorId].open++;
        } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          stats[creatorId].resolved++;
        }
      });
      setAgentStats(stats);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

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
    <Layout title="Team Members" navItems={navItems}>
      <div className="agents-grid">
        {loading ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-8)', gridColumn: '1 / -1' }}>Loading...</div>
        ) : agents.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 'var(--space-8)', gridColumn: '1 / -1' }}>No agents found</div>
        ) : (
          agents.filter(a => a.isActive).map((agent) => (
            <div key={agent.id} className="card agent-card">
              <div className="agent-card-header">
                <div className="agent-avatar-large" style={{ background: 'var(--accent)' }}>{agent.firstName?.[0]}{agent.lastName?.[0]}</div>
                <div className="agent-card-info">
                  <div className="agent-card-name">{agent.firstName} {agent.lastName}</div>
                  <div className="agent-card-role">Support Agent</div>
                </div>
              </div>
              <div className="agent-card-stats">
                <div><div className="agent-stat-value">{agentStats[agent.id]?.open || 0}</div><div className="agent-stat-label">Open</div></div>
                <div><div className="agent-stat-value">{agentStats[agent.id]?.resolved || 0}</div><div className="agent-stat-label">Resolved</div></div>
                <div><div className="agent-stat-value">-</div><div className="agent-stat-label">Avg Time</div></div>
              </div>
              <div className="agent-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/tl/agents/${agent.id}`)}>View Profile</button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default TLAgents;