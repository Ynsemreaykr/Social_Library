import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import FeedPage from '../features/feed/pages/FeedPage';
import DiscoverPage from '../features/content/pages/DiscoverPage';
import ContentDetailPage from '../features/content/pages/ContentDetailPage';
import UserProfilePage from '../features/user/pages/UserProfilePage';
import LibraryPage from '../features/library/pages/LibraryPage';
import EditProfilePage from '../features/user/pages/EditProfilePage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import CreateListPage from '../features/list/pages/CreateListPage';

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
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - simple layout */}
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route
          path="/register"
          element={
            <MainLayout>
              <RegisterPage />
            </MainLayout>
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

        {/* Public routes - main layout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <FeedPage />
            </MainLayout>
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

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

