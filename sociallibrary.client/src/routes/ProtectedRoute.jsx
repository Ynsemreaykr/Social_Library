import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

/**
 * Protected Route Component
 * Wrapper that checks if user is authenticated
 * Redirects to /login if not authenticated
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // İlk render'da token kontrolü yap
  useEffect(() => {
    // Token yoksa hemen login'e yönlendir
    if (!token) {
      setIsChecking(false);
      return;
    }
    
    // Token varsa, kısa bir süre bekle (App.jsx'teki validation tamamlansın)
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [token]);

  // Kontrol sırasında loading göster
  if (isChecking) {
    return null; // veya loading spinner
  }

  // Token yoksa veya geçersizse login'e yönlendir
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

