import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile) return <LoadingSpinner />;

  if (profile.is_suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Suspended</h2>
          <p className="text-gray-500 text-sm">Your account has been suspended. Please contact support.</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    const redirect = profile.role === 'SELLER' ? '/seller/dashboard'
      : profile.role === 'BUYER' ? '/buyer/dashboard'
      : '/admin/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
