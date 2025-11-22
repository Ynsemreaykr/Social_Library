import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Protected Route Component
 * Wrapper that checks if user is authenticated
 * Redirects to /login if not authenticated
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 * 
 * GEÇİCİ OLARAK DEVRE DIŞI: Veritabanı yok, arayüz testi için auth kontrolü kapatıldı
 */
const ProtectedRoute = ({ children }) => {
  // GEÇİCİ: Auth kontrolü devre dışı - arayüz testi için
  // const { isAuthenticated } = useAuth();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // Şimdilik direkt children'ı döndür (auth kontrolü yok)
  return children;
};

export default ProtectedRoute;

