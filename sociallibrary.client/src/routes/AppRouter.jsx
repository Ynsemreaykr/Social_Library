import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import FeedPage from '../features/feed/pages/FeedPage';

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

        {/* Public routes - main layout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <FeedPage />
            </MainLayout>
          }
        />

        {/* Protected routes - require authentication */}
        <Route
          path="/me/library"
          element={
            <ProtectedRoute>
              <MainLayout>
                <div>Kütüphanem - Coming Soon</div>
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

