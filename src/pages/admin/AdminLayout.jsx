import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaUsers,
  FaHamburger,
  FaCoffee,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaBox,
  FaUserCog
} from 'react-icons/fa';

const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Check if user is admin
  const isAdmin = user?.is_superuser || user?.is_cafe_staff;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { path: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard', exact: true },
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { path: '/admin/foods', icon: <FaHamburger />, label: 'Foods' },
    { path: '/admin/drinks', icon: <FaCoffee />, label: 'Drinks' },
    { path: '/admin/ordered-items', icon: <FaBox />, label: 'Ordered Items' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const statsItems = [
    { path: '/admin/revenue', icon: <FaMoneyBillWave />, label: 'Revenue' },
    { path: '/admin/delivery', icon: <FaMapMarkerAlt />, label: 'Delivery' },
    { path: '/admin/stock', icon: <FaBox />, label: 'Stock' },
    { path: '/admin/staff', icon: <FaUserCog />, label: 'Staff' },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar for Desktop */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FaUserCog className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Getem Cafe</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-white">{user?.username}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.is_superuser ? 'Super Admin' : 'Café Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Main
            </p>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path || 
                  (item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path))
                    ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 space-y-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Statistics
            </p>
            {statsItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Link to="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FaUserCog className="text-white text-lg" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-800 dark:text-white">Getem Cafe</h1>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FaTimes className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Mobile menu content */}
              <div className="p-4">
                <div className="space-y-1 mb-6">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaBars className="text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    {menuItems.find(item => 
                      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
                    )?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Welcome back, {user?.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <span className="text-lg">☀️</span>
                  ) : (
                    <span className="text-lg">🌙</span>
                  )}
                </button>

                <Link
                  to="/"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                >
                  View Site
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;