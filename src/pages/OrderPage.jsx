import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import orderApi from '../api/orderApi';
import addressApi from '../api/addressApi';
import PaymentModal from '../components/PaymentModal';
import { Link } from "react-router-dom"; 
import { HiArrowLeft, HiLocationMarker } from "react-icons/hi";
import { FaMapMarkerAlt } from "react-icons/fa";

// Default location: Addis Ababa, Ethiopia (Café Location)
const CAFE_LOCATION = {
  lat: 9.0320,
  lng: 38.7469,
  address: "Addis Ababa, Ethiopia"
};

// Default delivery location
const DEFAULT_LOCATION = {
  lat: 9.0320,
  lng: 38.7469,
  address: "Addis Ababa, Ethiopia"
};

// Helper function to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const OrderPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [position, setPosition] = useState(DEFAULT_LOCATION);
  const [manualAddress, setManualAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: '',
    longitude: ''
  });
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [distanceFromCafe, setDistanceFromCafe] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadCartItems();
    loadSavedAddresses();
    if (user?.phone_number) {
      setPhoneNumber(user.phone_number);
    }
  }, [user]);

  // Calculate distance when user location changes
  useEffect(() => {
    if (useCustomLocation && userLocation.latitude && userLocation.longitude) {
      calculateDistanceFromCafe();
    } else {
      setDistanceFromCafe(0);
    }
  }, [userLocation, useCustomLocation]);

  const loadCartItems = () => {
    const savedCart = localStorage.getItem('cart');
    const items = savedCart ? JSON.parse(savedCart) : [];
    
    const normalizedItems = items.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));
    setCartItems(normalizedItems);
  };

  const loadSavedAddresses = async () => {
    try {
      const response = await addressApi.getMyAddresses();
      const addresses = response.data.results || response.data || [];
      setSavedAddresses(addresses);
      
      const defaultAddress = addresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setManualAddress(defaultAddress.full_address || '');
      } else {
        setManualAddress(DEFAULT_LOCATION.address);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setManualAddress(DEFAULT_LOCATION.address);
    }
  };

  const calculateDistanceFromCafe = () => {
    setIsCalculating(true);
    try {
      const lat1 = CAFE_LOCATION.lat;
      const lng1 = CAFE_LOCATION.lng;
      const lat2 = parseFloat(userLocation.latitude);
      const lng2 = parseFloat(userLocation.longitude);
      
      if (!isNaN(lat2) && !isNaN(lng2)) {
        const distance = calculateDistance(lat1, lng1, lat2, lng2);
        setDistanceFromCafe(distance);
        toast.success(`Distance calculated: ${Math.round(distance)} meters`);
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      toast.error('Failed to calculate distance. Using default delivery fee.');
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateDeliveryFee = () => {
    if (!useCustomLocation || distanceFromCafe === 0) {
      return 2.99; // Base delivery fee
    }
    
    // Add $1 for every 100 meters beyond base distance
    const baseDistance = 500; // 500 meters free
    const additionalDistance = Math.max(0, distanceFromCafe - baseDistance);
    const additionalFee = Math.floor(additionalDistance / 100) * 1; // $1 per 100 meters
    
    return 2.99 + additionalFee;
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    
    const deliveryFee = calculateDeliveryFee();
    const tax = subtotal * 0.08;
    
    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + deliveryFee + tax).toFixed(2),
      distance: distanceFromCafe
    };
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeFromCart = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    toast.success('Item removed from cart');
  };

  const validateStep1 = () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to your cart first');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!manualAddress.trim()) {
      toast.error('Please enter delivery address');
      return false;
    }
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, '').length < 10) {
      toast.error('Please enter valid phone number (at least 10 digits)');
      return false;
    }
    // Validate coordinates if custom location is enabled
    if (useCustomLocation) {
      const lat = parseFloat(userLocation.latitude);
      const lng = parseFloat(userLocation.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error('Please enter valid latitude and longitude coordinates');
        return false;
      }
      
      if (lat < -90 || lat > 90) {
        toast.error('Latitude must be between -90 and 90 degrees');
        return false;
      }
      
      if (lng < -180 || lng > 180) {
        toast.error('Longitude must be between -180 and 180 degrees');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        menu_item: item.id,
        quantity: item.quantity,
        price: Number(item.price) || 0,
      }));

      // Use user's custom coordinates or default to cafe location
      const deliveryLat = useCustomLocation ? userLocation.latitude : String(CAFE_LOCATION.lat);
      const deliveryLng = useCustomLocation ? userLocation.longitude : String(CAFE_LOCATION.lng);

      const orderData = {
        items: orderItems,
        delivery_address: manualAddress,
        delivery_latitude: deliveryLat,
        delivery_longitude: deliveryLng,
        special_instructions: specialInstructions,
        phone_number: phoneNumber,
        payment_method: paymentMethod,
        delivery_distance: distanceFromCafe > 0 ? Math.round(distanceFromCafe) : null,
        delivery_fee: calculateDeliveryFee().toFixed(2),
      };

      // Create order first
      const response = await orderApi.createOrder(orderData);
      
      if (response.data) {
        setCurrentOrder(response.data);
        
        // Show payment modal for online payments
        if (paymentMethod === 'online') {
          setShowPaymentModal(true);
        } else {
          // For cash, just show success
          toast.success('Order placed successfully!');
          localStorage.removeItem('cart');
          setCartItems([]);
          navigate('/my-orders');
        }
      }
    } catch (error) {
      console.error('Order placement error:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              const errorMessage = messages[0];
              if (field === 'items' && errorMessage.includes('menu_item')) {
                toast.error('Invalid menu item. Please refresh and try again.');
              } else {
                toast.error(`${field}: ${errorMessage}`);
              }
            } else if (typeof messages === 'string') {
              toast.error(`${field}: ${messages}`);
            }
          });
        } else if (typeof errorData === 'string') {
          toast.error(errorData);
        } else {
          toast.error('Invalid order data. Please check all fields.');
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add payment success handler:
  const handlePaymentSuccess = async (method, paymentData) => {
    try {
      if (method === 'cash') {
        // Update order with cash payment
        await orderApi.updateOrder(currentOrder.id, { payment_method: 'cash' });
      }
      
      toast.success('Order placed successfully!');
      localStorage.removeItem('cart');
      setCartItems([]);
      
      // Navigate based on payment method
      if (method === 'chapa') {
        navigate(`/order/payment-success?tx_ref=${paymentData.tx_ref}`);
      } else {
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error updating order status');
    }
  };

  // Auto-detect user's current location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.loading('Detecting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });
        setUseCustomLocation(true);
        toast.dismiss();
        toast.success('Location detected!');
      },
      (error) => {
        toast.dismiss();
        toast.error('Unable to retrieve your location');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const totals = calculateTotal();

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return numPrice.toFixed(2);
  };

  const calculateItemTotal = (item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return price * quantity;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center text-gray-700 dark:text-gray-300 mb-1 hover:underline">
          <HiArrowLeft className="mr-2" />
          Back to Home
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Place Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your order in 3 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  step >= stepNum
                    ? 'bg-gradient-to-r from-orange-500 to-purple-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                {step > stepNum ? '✓' : stepNum}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {stepNum === 1 && 'Cart Items'}
                {stepNum === 2 && 'Delivery'}
                {stepNum === 3 && 'Review'}
              </span>
            </div>
          ))}
          <div className="absolute top-6 left-16 right-16 h-1 bg-gray-300 dark:bg-gray-700 -z-10">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Cart Items */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Your Cart</h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Your cart is empty</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add some delicious items from our menu
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-block btn-primary px-6 py-3"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-2xl">{item.category_type === 'food' ? '🍔' : '🥤'}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-white">{item.name || 'Unnamed Item'}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        ${formatPrice(item.price)} each
                      </p>
                      {item.category_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {item.category_name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium text-gray-800 dark:text-white">{item.quantity || 0}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="w-24 text-right">
                        <p className="font-bold text-gray-800 dark:text-white">${formatPrice(calculateItemTotal(item))}</p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold mb-3 text-gray-800 dark:text-white">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Delivery Fee:</span>
                      <span>${totals.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Tax (8%):</span>
                      <span>${totals.tax}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white">
                      <span>Total:</span>
                      <span>${totals.total}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNextStep}
                    className="btn-primary px-8 py-3"
                  >
                    Continue to Delivery
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Delivery Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Delivery Details</h2>
            
            <div className="space-y-6">
              {/* Café Location Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-1">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Our Café Location</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {CAFE_LOCATION.address}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Coordinates: {CAFE_LOCATION.lat}° N, {CAFE_LOCATION.lng}° E
                    </p>
                  </div>
                </div>
              </div>
              
            
              
              {/* Address Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600 min-h-[80px]"
                  placeholder="Enter your complete delivery address in Addis Ababa"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We currently deliver within Addis Ababa only
                </p>
              </div>
              
              {/* Custom Location Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Custom Location Coordinates</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter your exact coordinates for precise delivery fee calculation
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useCustomLocation"
                      checked={useCustomLocation}
                      onChange={(e) => setUseCustomLocation(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                    />
                    <label htmlFor="useCustomLocation" className="text-sm text-gray-700 dark:text-gray-300">
                      Enable custom location
                    </label>
                  </div>
                </div>
                
                {useCustomLocation && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Latitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          value={userLocation.latitude}
                          onChange={(e) => setUserLocation(prev => ({ ...prev, latitude: e.target.value }))}
                          className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          placeholder="e.g., 9.0320"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Between -90 and 90 degrees
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Longitude *
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          value={userLocation.longitude}
                          onChange={(e) => setUserLocation(prev => ({ ...prev, longitude: e.target.value }))}
                          className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          placeholder="e.g., 38.7469"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Between -180 and 180 degrees
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={detectCurrentLocation}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors text-sm"
                      >
                        <HiLocationMarker className="mr-2" />
                        Detect My Location
                      </button>
                      
                      <button
                        onClick={calculateDistanceFromCafe}
                        disabled={isCalculating || !userLocation.latitude || !userLocation.longitude}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCalculating ? (
                          <>
                            <div className="spinner mr-2"></div>
                            Calculating...
                          </>
                        ) : (
                          'Calculate Distance'
                        )}
                      </button>
                    </div>
                    
                    {/* Distance & Delivery Fee Info */}
                    {distanceFromCafe > 0 && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Distance from Café</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                              {Math.round(distanceFromCafe)} meters
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                              ${calculateDeliveryFee().toFixed(2)}
                              {distanceFromCafe > 500 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  (Base $2.99 + ${(calculateDeliveryFee() - 2.99).toFixed(2)} distance fee)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          * $1 added for every 100 meters beyond 500m from café
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {!useCustomLocation && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📦 Standard delivery fee of ${calculateDeliveryFee().toFixed(2)} will be applied.
                      Enable custom location for precise distance-based pricing.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Contact Information */}
              <div >
                <div className='mb-4'>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    placeholder="09******** \ 07******** "
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="input-field dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    placeholder="'Leave at door', 'Call on arrival', the time you want the delivery, apartment etc."
                  />
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                ← Back to Cart
              </button>
              <button
                onClick={handleNextStep}
                className="btn-primary px-8 py-3"
              >
                Review Order →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Place Order */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card dark:bg-gray-800 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Review Your Order</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div>
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Order Details</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{item.name || 'Unnamed Item'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity || 0} × ${formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        ${formatPrice(calculateItemTotal(item))}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Delivery Fee:</span>
                      <span>${totals.deliveryFee}</span>
                      {distanceFromCafe > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({Math.round(distanceFromCafe)} meters)
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Tax (8%):</span>
                      <span>${totals.tax}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white">
                      <span>Total:</span>
                      <span>${totals.total}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery & Payment Info */}
              <div className="space-y-6">
                {/* Delivery Information */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Delivery Information</h3>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                    <p className="font-medium text-gray-800 dark:text-white">{manualAddress || 'No address provided'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      📍 Addis Ababa, Ethiopia
                    </p>
                    {useCustomLocation && userLocation.latitude && userLocation.longitude && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        📍 Coordinates: {userLocation.latitude}° N, {userLocation.longitude}° E
                      </p>
                    )}
                    {distanceFromCafe > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        📏 Distance: {Math.round(distanceFromCafe)} meters from café
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      📞 {phoneNumber || 'No phone number provided'}
                    </p>
                    {specialInstructions && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        📝 {specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['cash', 'online'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-4 border rounded-xl text-center transition-colors ${
                          paymentMethod === method
                            ? method === 'online' 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {method === 'cash' ? '💵' : '🌐'}
                        </div>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {method === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                        {method === 'online' && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            Secure payment with Chapa
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Payment Note */}
                  <div className="mt-4 p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {paymentMethod === 'cash' 
                        ? '💵 Pay with cash when your order arrives'
                        : '🔐 Secure online payment powered by Chapa. You will be redirected to a secure payment page.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms & Place Order */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-2 mb-6">
                <input
                  type="checkbox"
                  id="confirm"
                  required
                  className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <label htmlFor="confirm" className="text-sm text-gray-600 dark:text-gray-400">
                  I confirm that all information is correct and I agree to the 
                  <a href="/terms" className="text-blue-600 dark:text-blue-400 mx-1">terms and conditions</a>
                  of CaféDelights.
                </label>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  ← Back to Delivery
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderId={currentOrder?.id}
        totalAmount={totals.total}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default OrderPage;