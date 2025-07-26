import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import ReservationsPage from './pages/ReservationsPage';
import GuestsPage from './pages/GuestsPage';
import BillingPage from './pages/BillingPage';
import HousekeepingPage from './pages/HousekeepingPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/guests" element={<GuestsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default App; 