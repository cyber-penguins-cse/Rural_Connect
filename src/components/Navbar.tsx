import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, ShoppingBag, LayoutDashboard, LogOut, CircleUser as UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileOpen(false);
  };

  const dashboardPath =
    profile?.role === 'SELLER' ? '/seller/dashboard'
    : profile?.role === 'BUYER' ? '/buyer/dashboard'
    : profile?.role === 'ADMIN' ? '/admin/dashboard'
    : '/home';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-700 transition-colors">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Rural<span className="text-purple-600">Connect</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/products"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/products') ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
              }`}
            >
              Marketplace
            </Link>
            {user && dashboardPath && (
              <Link
                to={dashboardPath}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith(dashboardPath) ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:text-gray-900 hover:bg-stone-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg">
                  <UserCircle className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-700 font-medium">{profile.full_name.split(' ')[0]}</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{profile.role}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-stone-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          <Link to="/products" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-stone-100">
            <ShoppingBag className="w-4 h-4" /> Marketplace
          </Link>
          {user && dashboardPath && (
            <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-stone-100">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
          {user ? (
            <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-center text-sm font-medium border border-stone-200 rounded-lg text-gray-700 hover:bg-stone-50">Sign in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-center text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700">Get started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

