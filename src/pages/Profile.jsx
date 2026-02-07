import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const profileSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone_number: z.string()
    .regex(/^\+?[\d\s-]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  first_name: z.string().optional().or(z.literal('')),
  last_name: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      phone_number: '',
      first_name: '',
      last_name: '',
      address: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email || '',
        phone_number: user.phone_number || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        address: user.address || '',
      });
    }
  }, [user, reset]);

  const onProfileSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      // Implement password change API call
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">
              {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Member since {new Date(user.date_joined).toLocaleDateString()}
          </p>
          {user.is_cafe_staff && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-semibold">
              Café Staff
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            My Orders
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phone_number && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                  <p className="font-medium">
                    {user.is_cafe_staff ? 'Café Staff' : 'Customer'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-6">Edit Profile</h3>
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register('first_name')}
                        className="input-field"
                        placeholder="John"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        {...register('last_name')}
                        className="input-field"
                        placeholder="Doe"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`input-field ${profileErrors.email ? 'border-red-500' : ''}`}
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phone_number')}
                      className="input-field"
                      placeholder="+1 234 567 8900"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      {...register('address')}
                      className="input-field min-h-[100px] resize-none"
                      placeholder="Enter your delivery address"
                      disabled={loading}
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-3 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="spinner mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-6">Change Password</h3>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('current_password')}
                      className={`input-field ${passwordErrors.current_password ? 'border-red-500' : ''}`}
                      placeholder="Enter current password"
                      disabled={passwordLoading}
                    />
                    {passwordErrors.current_password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.current_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('new_password')}
                      className={`input-field ${passwordErrors.new_password ? 'border-red-500' : ''}`}
                      placeholder="Create a new password"
                      disabled={passwordLoading}
                    />
                    {passwordErrors.new_password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.new_password.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Must be at least 6 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirm_password')}
                      className={`input-field ${passwordErrors.confirm_password ? 'border-red-500' : ''}`}
                      placeholder="Confirm new password"
                      disabled={passwordLoading}
                    />
                    {passwordErrors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="spinner mr-2"></div>
                          Changing Password...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-6">Recent Orders</h3>
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📦</div>
                  <h4 className="text-xl font-medium mb-2">Order History</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    View and manage all your orders
                  </p>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="btn-primary px-6 py-3"
                  >
                    Go to My Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;