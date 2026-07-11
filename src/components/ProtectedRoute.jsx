import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShellSkeleton } from './skeleton';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AppShellSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
