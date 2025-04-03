import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onAddMovie?: () => void;
  showAddMovie?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddMovie, showAddMovie }) => {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold">
              Movie Collection
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && isHomePage && showAddMovie && (
              <button
                onClick={onAddMovie}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Add Movie
              </button>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign out
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/signin"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 