import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatDrawer from './components/AIChatDrawer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public & Student Pages
import HomePage from './pages/HomePage';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import DashboardPage from './pages/DashboardPage';
import ReservationsPage from './pages/ReservationsPage';
import FavoritesPage from './pages/FavoritesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSpacesPage from './pages/admin/AdminSpacesPage';
import AdminSeatingPage from './pages/admin/AdminSeatingPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';

import './App.css';

export function App() {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar onOpenAI={() => setIsAIOpen(true)} />

          <div style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage onOpenAI={() => setIsAIOpen(true)} />} />
              <Route path="/spaces" element={<SpacesPage />} />
              <Route path="/spaces/:id" element={<SpaceDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage onOpenAI={() => setIsAIOpen(true)} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute>
                    <ReservationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/spaces"
                element={
                  <AdminRoute>
                    <AdminSpacesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/seating/:spaceId"
                element={
                  <AdminRoute>
                    <AdminSeatingPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <AdminRoute>
                    <AdminStudentsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/reservations"
                element={
                  <AdminRoute>
                    <AdminReservationsPage />
                  </AdminRoute>
                }
              />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>

          <Footer />

          {/* Floating Grounded AI Assistant Drawer */}
          <AIChatDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
