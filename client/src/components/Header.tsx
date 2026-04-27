import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, LogOut, MessageSquare } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="text-sky-500 fill-sky-500" size={24} />
          <span className="text-xl font-bold tracking-tight text-slate-800">SevaNet AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-sky-600">Explore</Link>
          {user && (
            <>
              <Link to="/submit-need" className="text-sm font-medium text-slate-600 hover:text-sky-600">Submit Need</Link>
              <Link to="/feedback" className="text-sm font-medium text-slate-600 hover:text-sky-600">Give Feedback</Link>
              {user.role === 'admin' && (
                <Link to="/admin/feedback" className="text-sm font-medium text-sky-600 font-semibold">Admin Panel</Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Login</Link>
              <Link to="/register" className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Join Community
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
