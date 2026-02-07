import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FoodCard from '../components/FoodCard';
import DrinkCard from '../components/DrinkCard';
import menuApi from '../api/menuApi';
import orderApi from '../api/orderApi';
// import { useCart } from '../context/CartContext';

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const [foodResponse, drinkResponse] = await Promise.all([
        menuApi.getFoodItems(),
        menuApi.getDrinkItems(),
      ]);
      
      setFoods(foodResponse.data.results || foodResponse.data);
      setDrinks(drinkResponse.data.results || drinkResponse.data);
    } catch (error) {
      toast.error('Failed to load menu items');
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

// In Home.jsx, update the handleOrder function:
const handleOrder = (item) => {
  if (!isAuthenticated) {
    toast.error('Please login to place an order');
    navigate('/login');
    return;
  }
  
  // Add to cart
  const cart = orderApi.getCartItems();
  const existingItem = cart.find(i => i.id === item.id);
  
  let updatedCart;
  if (existingItem) {
    updatedCart = cart.map(i =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    );
  } else {
    updatedCart = [...cart, { ...item, quantity: 1 }];
  }
  
  orderApi.saveCartItems(updatedCart);
  toast.success(`${item.name} added to cart!`);
  
  // Redirect to order page
  navigate('/order');
};

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading delicious items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-[aliceblue]/90 dark:bg-[aliceblue]/90">
     

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 ">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Food Section - Left */}
          <motion.div variants={itemVariants} className="lg:pr-4" id="food-section">
            <div className="lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 md:gap-3">
                  <span className="p-1 md:p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <span className="text-lg md:text-xl"></span>
                  </span>
                  <span>Food Menu</span>
                </h2>
               
              </div>
              
              {foods.length === 0 ? (
                <div className="card text-center py-8 md:py-12">
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">🍕</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">No food items found</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    Food menu is being updated
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {foods.map((item) => (
                    <FoodCard 
                      key={item.id} 
                      item={item} 
                      onOrder={() => handleOrder(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Drinks Section - Right */}
          <motion.div variants={itemVariants} className="lg:pl-4" id="drink-section">
            <div className="lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 md:gap-3">
                  <span className="p-1 md:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-lg md:text-xl"></span>
                  </span>
                  <span>Drink Menu</span>
                </h2>
               
              </div>
              
              {drinks.length === 0 ? (
                <div className="card text-center py-8 md:py-12">
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">☕</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2">No drink items found</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                    Drink menu is being updated
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {drinks.map((item) => (
                    <DrinkCard 
                      key={item.id} 
                      item={item} 
                      onOrder={() => handleOrder(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          <div className="card text-center py-4 md:py-6">
            <div className="text-2xl md:text-3xl mb-2">🏍</div>
            <h3 className="text-base md:text-lg font-semibold mb-1">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">30-45 minutes</p>
          </div>
          <div className="card text-center py-4 md:py-6">
            <div className="text-2xl md:text-3xl mb-2">🥗</div>
            <h3 className="text-base md:text-lg font-semibold mb-1">Fresh Ingredients</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">100% fresh & organic</p>
          </div>
          <div className="card text-center py-4 md:py-6">
            <div className="text-2xl md:text-3xl mb-2">💳</div>
            <h3 className="text-base md:text-lg font-semibold mb-1">Easy Payment</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Multiple options</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;