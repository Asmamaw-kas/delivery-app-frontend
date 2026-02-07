import { Link } from 'react-router-dom';
import { NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import { useState } from 'react';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Check if user is admin (superuser or cafe staff)
  const isAdmin = user?.is_superuser || user?.is_cafe_staff;

  return (
    <header className="sticky top-0 z-50 bg-[aliceblue]/90 dark:bg-[aliceblue]/90 ">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 md:gap-2">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center p-0 m-0">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>

            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
              Cafe
            </span>
          </Link>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) =>
                    isActive 
                      ? "text-orange-600 font-medium underline dark:text-orange-400 transition-colors" 
                      : "text-orange-400 font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  }>
              Home
            </NavLink>
           
            {isAuthenticated && (
              <>
                <NavLink 
                  to="/my-orders"
                  className={({ isActive }) =>
                    isActive 
                      ? "text-orange-600 font-medium underline dark:text-orange-400 transition-colors" 
                      : "text-orange-400 font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  }
                >
                  My Orders
                </NavLink>

                <NavLink to="/order"  className={({ isActive }) =>
                    isActive 
                      ? "text-orange-600 font-medium underline dark:text-orange-400 transition-colors" 
                      : "text-orange-400 font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  }>
                  Order & Pay
                </NavLink>
                {/* Admin Link - Only show for admin users */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-purple-400 font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1"
                  >
                    <span>👑</span>
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
           {/* <button
              onClick={toggleTheme}
              className="p-1.5 md:p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <span className="text-lg md:text-xl">☀️</span>
              ) : (
                <span className="text-lg md:text-xl">🌙</span>
              )}
            </button> */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="text-xl">
                {mobileMenuOpen ? '✕' : '☰'}
              </span>
            </button>

            {/* Desktop Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* User Info with Admin Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hi, {user?.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isAdmin ? (
                          <span className="flex items-center gap-1">
                            <span>👑</span>
                            <span>{user?.is_superuser ? 'Super Admin' : 'Café Staff'}</span>
                          </span>
                        ) : (
                          'Customer'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-2 flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xl">🏠</span>
                <span>Home</span>
              </Link>
              <button
                onClick={() => scrollToSection('food-section')}
                className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-2 text-left flex items-center gap-3"
              >
                <span className="text-xl">🍔</span>
                <span>Foods</span>
              </button>
              <button
                onClick={() => scrollToSection('drink-section')}
                className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 text-left flex items-center gap-3"
              >
                <span className="text-xl">🥤</span>
                <span>Drinks</span>
              </button>
              
              {/* Authenticated User Links */}
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/my-orders" 
                    className="font-medium hover:text-purple-600 dark:hover:text-purple-400 transition-colors py-2 flex items-center gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">📦</span>
                    <span>My Orders</span>
                  </Link>
                  <Link 
                    to="/order" 
                    className="font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 flex items-center gap-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl">🛒</span>
                    <span>Order & Pay</span>
                  </Link>
                  
                  {/* Admin Link in Mobile Menu */}
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors py-2 flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-xl">👑</span>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </>
              ) : null}
              
              {/* User Info Section for Mobile */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {user?.username}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isAdmin ? (
                          <span className="flex items-center gap-1">
                            <span>👑</span>
                            <span>{user?.is_superuser ? 'Super Admin' : 'Café Staff'}</span>
                          </span>
                        ) : (
                          'Customer'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Admin Action in Mobile */}
                  {isAdmin && (
                    <Link
                      to="/admin/orders"
                      className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>📊</span>
                      <span>Manage Orders</span>
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🔑</span>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>📝</span>
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}

              {/* Contact Info in Mobile Menu */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Need help? Contact us:
                </p>
                <div className="flex flex-col gap-1">
                  <a href="tel:+1234567890" className="text-sm text-blue-600 dark:text-blue-400">
                    📞 +1 234 567 8900
                  </a>
                  <a href="mailto:info@cafedelights.com" className="text-sm text-blue-600 dark:text-blue-400">
                    ✉️ info@cafedelights.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;