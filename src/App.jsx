import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentModal from './components/PaymentModal';
import PaymentCancel from './pages/PaymentCancel';
import Profile from './pages/Profile';
import OrderPage from './pages/OrderPage';
import MyOrders from './pages/MyOrders';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import OrderedItems from './pages/admin/OrderedItems';
import Foods from './pages/admin/Foods';
import Drinks from './pages/admin/Drinks'; 
import Users from './pages/admin/Users';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
// import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
            
            {/* Protected routes */}
            <Route path="/order" element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            } />
            <Route path="/order/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/payment/cancel" element={
              <ProtectedRoute>
                <PaymentCancel />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentModal />
              </ProtectedRoute>
            } />

            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="foods" element={<Foods />} />
              <Route path="ordered-items" element={<OrderedItems />} />
              <Route path="drinks" element={<Drinks />} />
              <Route path="users" element={<Users />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;