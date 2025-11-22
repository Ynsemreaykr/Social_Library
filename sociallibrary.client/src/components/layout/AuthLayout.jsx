/**
 * Auth Layout Component
 * Simple layout for login/register pages
 * Provides minimal styling without navigation
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      {children}
    </div>
  );
};

export default AuthLayout;

