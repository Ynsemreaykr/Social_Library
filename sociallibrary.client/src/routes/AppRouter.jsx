import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import FeedPage from '../features/feed/pages/FeedPage';
import DiscoverPage from '../features/content/pages/DiscoverPage';
import ContentDetailPage from '../features/content/pages/ContentDetailPage';
import UserProfilePage from '../features/user/pages/UserProfilePage';
import LibraryPage from '../features/library/pages/LibraryPage';
import EditProfilePage from '../features/user/pages/EditProfilePage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import CreateListPage from '../features/list/pages/CreateListPage';
import { useAuth } from '../hooks/useAuth';

/**
 * App Router
 * Defines all routes using React Router v6
 * 
 * Routes:
 * - /login, /register - public auth pages
 * - / - public home page (feed)
 * - /me/library - protected user library page
 * 
 * Future routes (to be implemented):
 * - /content - public content list
 * - /content/:id - public content detail
 * - /users/:id - public user profile
 */

// Login/Register sayfalarında giriş yapmış kullanıcıyı ana sayfaya yönlendir
const AuthRouteGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Eğer giriş yapmışsa ve login/register sayfasındaysa, ana sayfaya yönlendir
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      window.location.href = '/';
    }
  }, [isAuthenticated, location.pathname]);

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - simple layout */}
        <Route
          path="/login"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <LoginPage />
              </MainLayout>
            </AuthRouteGuard>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRouteGuard>
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            </AuthRouteGuard>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <MainLayout>
              <ForgotPasswordPage />
            </MainLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <MainLayout>
              <ResetPasswordPage />
            </MainLayout>
          }
        />

        {/* Public routes - main layout */}
        {/* Ana sayfa - giriş yapmamışsa login'e yönlendir */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FeedPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <MainLayout>
              <DiscoverPage />
            </MainLayout>
          }
        />
        <Route
          path="/content/:type/:id"
          element={
            <MainLayout>
              <ContentDetailPage />
            </MainLayout>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/me/library"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LibraryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* User Profile Pages */}
        <Route
          path="/users/:userId"
          element={
            <MainLayout>
              <UserProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/users/:userId/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* List Pages */}
        <Route
          path="/lists/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateListPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home (which will redirect to login if not authenticated) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

