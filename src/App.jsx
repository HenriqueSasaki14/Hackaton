import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TrailsPage from './pages/TrailsPage';
import TrailDetailPage from './pages/TrailDetailPage';
import ActivityPage from './pages/ActivityPage';
import ProjectsPage from './pages/ProjectsPage';
import CommunityPage from './pages/CommunityPage';
import AdminPage from './pages/AdminPage';

import './styles/global.css';

function AppLayout({ children, hideFooter }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <AppLayout>
                <LandingPage />
              </AppLayout>
            }
          />
          <Route
            path="/auth"
            element={
              <AppLayout hideFooter>
                <AuthPage />
              </AppLayout>
            }
          />
          <Route
            path="/trilhas"
            element={
              <AppLayout>
                <TrailsPage />
              </AppLayout>
            }
          />
          <Route
            path="/comunidade"
            element={
              <AppLayout>
                <CommunityPage />
              </AppLayout>
            }
          />

          {/* Private — requires login */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout hideFooter>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/trilhas/:id"
            element={
              <PrivateRoute>
                <AppLayout>
                  <TrailDetailPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/atividade/:trailId/:activityId"
            element={
              <PrivateRoute>
                <AppLayout hideFooter>
                  <ActivityPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projetos"
            element={
              <PrivateRoute>
                <AppLayout>
                  <ProjectsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AppLayout hideFooter>
                  <AdminPage />
                </AppLayout>
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
