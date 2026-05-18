import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import CreateTicket from './pages/agent/CreateTicket';
import MyTickets from './pages/agent/MyTickets';
import AgentProfile from './pages/agent/Profile';

// TL Pages
import TLDashboard from './pages/tl/Dashboard';
import TeamTickets from './pages/tl/TeamTickets';
import Escalations from './pages/tl/Escalations';
import TLAgents from './pages/tl/Agents';
import TLProfile from './pages/tl/Profile';
import TLAgentProfile from './pages/tl/AgentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTickets from './pages/admin/Tickets';
import AdminAnalytics from './pages/admin/Analytics';
import AdminProfile from './pages/admin/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'AGENT': return '/agent/dashboard';
      case 'TL': return '/tl/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} /> : <Login />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getDefaultRoute()} /> : <ForgotPassword />} />

      {/* Agent Routes */}
      <Route path="/agent/*" element={
        <ProtectedRoute allowedRoles={['AGENT']}>
          <Routes>
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="create-ticket" element={<CreateTicket />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="profile" element={<AgentProfile />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* TL Routes */}
      <Route path="/tl/*" element={
        <ProtectedRoute allowedRoles={['TL']}>
          <Routes>
            <Route path="dashboard" element={<TLDashboard />} />
            <Route path="team-tickets" element={<TeamTickets />} />
            <Route path="escalations" element={<Escalations />} />
            <Route path="agents" element={<TLAgents />} />
            <Route path="agents/:id" element={<TLAgentProfile />} />
            <Route path="profile" element={<TLProfile />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Default */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
};

export default App;