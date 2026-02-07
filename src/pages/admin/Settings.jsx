import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaBell, FaShieldAlt, FaCog, FaStore, FaCreditCard, FaTruck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    cafeName: 'Getem Cafe',
    cafeEmail: 'info@getemcafe.com',
    cafePhone: '+251 123 456 789',
    cafeAddress: 'Addis Ababa, Ethiopia',
    
    // Business Settings
    openingTime: '08:00',
    closingTime: '22:00',
    deliveryRadius: 10, // km
    deliveryFee: 2.99,
    minOrderAmount: 5.00,
    
    // Payment Settings
    acceptCash: true,
    acceptCard: true,
    acceptOnline: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    
    // Security Settings
    requireLogin: true,
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
  });

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: typeof value === 'string' && !isNaN(value) && value.includes('.') 
        ? parseFloat(value) 
        : value
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, you would save to backend
    toast.success('Settings saved successfully');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'business', label: 'Business', icon: <FaStore /> },
    { id: 'payment', label: 'Payment', icon: <FaCreditCard /> },
    { id: 'delivery', label: 'Delivery', icon: <FaTruck /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Café Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Café Name
            </label>
            <input
              type="text"
              value={settings.cafeName}
              onChange={(e) => handleInputChange('general', 'cafeName', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.cafeEmail}
              onChange={(e) => handleInputChange('general', 'cafeEmail', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={settings.cafePhone}
              onChange={(e) => handleInputChange('general', 'cafePhone', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              value={settings.cafeAddress}
              onChange={(e) => handleInputChange('general', 'cafeAddress', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Logo & Branding</h3>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-4xl text-white font-bold">GC</span>
          </div>
          <div>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors mb-2">
              Upload New Logo
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recommended: 500x500px PNG or JPG
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Operating Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opening Time
            </label>
            <input
              type="time"
              value={settings.openingTime}
              onChange={(e) => handleInputChange('business', 'openingTime', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Closing Time
            </label>
            <input
              type="time"
              value={settings.closingTime}
              onChange={(e) => handleInputChange('business', 'closingTime', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Delivery Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Radius (km)
            </label>
            <input
              type="number"
              value={settings.deliveryRadius}
              onChange={(e) => handleInputChange('business', 'deliveryRadius', e.target.value)}
              className="input-field"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.deliveryFee}
              onChange={(e) => handleInputChange('business', 'deliveryFee', e.target.value)}
              className="input-field"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Order ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.minOrderAmount}
              onChange={(e) => handleInputChange('business', 'minOrderAmount', e.target.value)}
              className="input-field"
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Payment Methods</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-green-600 dark:text-green-400">💵</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Cash on Delivery</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accept cash payments</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.acceptCash}
              onChange={(e) => handleInputChange('payment', 'acceptCash', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-blue-600 dark:text-blue-400">💳</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Credit/Debit Cards</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accept card payments</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.acceptCard}
              onChange={(e) => handleInputChange('payment', 'acceptCard', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-purple-600 dark:text-purple-400">🌐</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Online Payments</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accept online payments</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.acceptOnline}
              onChange={(e) => handleInputChange('payment', 'acceptOnline', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderDeliverySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Delivery Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Delivery Time (minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value="45"
                className="w-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">45 min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Areas
            </label>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Currently delivering to:</p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                <li>Addis Ababa - Central Area</li>
<li>Addis Ababa - Bole Area</li>
                <li>Addis Ababa - Kazanchis Area</li>
                <li>Addis Ababa - Megenagna Area</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Notification Preferences</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">SMS Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Order Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified for new orders</p>
            </div>
            <input
              type="checkbox"
              checked={settings.orderAlerts}
              onChange={(e) => handleInputChange('notifications', 'orderAlerts', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Low Stock Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when stock is low</p>
            </div>
            <input
              type="checkbox"
              checked={settings.lowStockAlerts}
              onChange={(e) => handleInputChange('notifications', 'lowStockAlerts', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Security Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Require Login</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Users must login to place orders</p>
            </div>
            <input
              type="checkbox"
              checked={settings.requireLogin}
              onChange={(e) => handleInputChange('security', 'requireLogin', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extra security for admin accounts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
              className="h-5 w-5 text-blue-600 rounded"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
              className="input-field"
              min="5"
              max="120"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'business': return renderBusinessSettings();
      case 'payment': return renderPaymentSettings();
      case 'delivery': return renderDeliverySettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your café delivery system
          </p>
        </div>
        
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FaSave />
          Save Settings
        </button>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
      >
        <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200">Danger Zone</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              These actions are irreversible. Please proceed with caution.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all settings to default?')) {
                    toast.success('Settings reset to default');
                  }
                }}
                className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                Reset All Settings
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all test data? This cannot be undone!')) {
                    toast.success('Test data deleted');
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete Test Data
              </button>
              <button
                onClick={() => {
                  if (window.confirm('This will permanently delete your café account. Are you absolutely sure?')) {
                    toast.error('Account deletion initiated');
                  }
                }}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;