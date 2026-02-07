import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaCoffee } from 'react-icons/fa';
import menuApi from '../../api/menuApi';
import { toast } from 'react-hot-toast';

const Drinks = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [categories, setCategories] = useState([]);

  // New drink form
  const [newDrink, setNewDrink] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparation_time: 5,
    is_available: true,
    image: null,
  });

  useEffect(() => {
    fetchDrinks();
    fetchCategories();
  }, []);

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      const response = await menuApi.getMenuItems();
      const items = response.data.results || response.data || [];
      const drinkItems = items.filter(item => 
        item.category_type === 'drink' || item.category?.category_type === 'drink'
      );
      setDrinks(drinkItems);
    } catch (error) {
      toast.error('Failed to load drinks');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await menuApi.getCategories();
      const drinkCategories = (response.data.results || response.data || [])
        .filter(cat => cat.category_type === 'drink');
      setCategories(drinkCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddDrink = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newDrink.name);
      formData.append('description', newDrink.description);
      formData.append('price', newDrink.price);
      formData.append('category', newDrink.category);
      formData.append('preparation_time', newDrink.preparation_time);
      formData.append('is_available', newDrink.is_available);
      if (newDrink.image) {
        formData.append('image', newDrink.image);
      }

      await menuApi.createMenuItem(formData);
      toast.success('Drink item added successfully');
      setShowAddModal(false);
      resetForm();
      fetchDrinks();
    } catch (error) {
      toast.error('Failed to add drink item');
    }
  };

  const handleUpdateDrink = async (e) => {
    e.preventDefault();
    if (!selectedDrink) return;
    
    try {
      const formData = new FormData();
      formData.append('name', newDrink.name);
      formData.append('description', newDrink.description);
      formData.append('price', newDrink.price);
      formData.append('category', newDrink.category);
      formData.append('preparation_time', newDrink.preparation_time);
      formData.append('is_available', newDrink.is_available);
      if (newDrink.image) {
        formData.append('image', newDrink.image);
      }

      await menuApi.updateMenuItem(selectedDrink.id, formData);
      toast.success('Drink item updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchDrinks();
    } catch (error) {
      toast.error('Failed to update drink item');
    }
  };

  const handleDeleteDrink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drink item?')) return;
    
    try {
      await menuApi.deleteMenuItem(id);
      toast.success('Drink item deleted');
      fetchDrinks();
    } catch (error) {
      toast.error('Failed to delete drink item');
    }
  };

  const resetForm = () => {
    setNewDrink({
      name: '',
      description: '',
      price: '',
      category: '',
      preparation_time: 5,
      is_available: true,
      image: null,
    });
    setSelectedDrink(null);
  };

  const filteredDrinks = drinks.filter(drink =>
    drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drink.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading drinks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Drinks Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredDrinks.length} drink items
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FaPlus />
          Add New Drink
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search drinks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Drinks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrinks.map((drink) => (
          <motion.div
            key={drink.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card hover:shadow-xl transition-shadow"
          >
            <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
              {drink.image ? (
                <img
                  src={drink.image}
                  alt={drink.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 flex items-center justify-center">
                  <FaCoffee className="text-4xl text-blue-500 dark:text-blue-400" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  drink.is_available
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {drink.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {drink.category && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {drink.category.name}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{drink.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {drink.description || 'No description'}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${parseFloat(drink.price).toFixed(2)}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {drink.preparation_time} min prep
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type: <span className="font-medium">{drink.category_type || 'Drink'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/menu/items/${drink.id}`, '_blank')}
                  className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaEye />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedDrink(drink);
                    setNewDrink({
                      name: drink.name,
                      description: drink.description || '',
                      price: drink.price,
                      category: drink.category?.id || '',
                      preparation_time: drink.preparation_time || 5,
                      is_available: drink.is_available,
                      image: null,
                    });
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDrink(drink.id)}
                  className="flex-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDrinks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🥤</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No drink items found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try a different search term' : 'Add your first drink item'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Add New Drink
          </button>
        </div>
      )}

      {/* Add Drink Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Drink</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddDrink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Drink Name *
                  </label>
                  <input
                    type="text"
                    value={newDrink.name}
                    onChange={(e) => setNewDrink({...newDrink, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDrink.description}
                    onChange={(e) => setNewDrink({...newDrink, description: e.target.value})}
                    className="input-field min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newDrink.price}
                      onChange={(e) => setNewDrink({...newDrink, price: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newDrink.category}
                      onChange={(e) => setNewDrink({...newDrink, category: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      value={newDrink.preparation_time}
                      onChange={(e) => setNewDrink({...newDrink, preparation_time: e.target.value})}
                      className="input-field"
                      min="1"
                      max="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newDrink.is_available}
                      onChange={(e) => setNewDrink({...newDrink, is_available: e.target.value === 'true'})}
                      className="input-field"
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Drink Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewDrink({...newDrink, image: e.target.files[0]})}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recommended: 500x500px PNG or JPG
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Add Drink
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Drink Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Drink</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateDrink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Drink Name *
                  </label>
                  <input
                    type="text"
                    value={newDrink.name}
                    onChange={(e) => setNewDrink({...newDrink, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDrink.description}
                    onChange={(e) => setNewDrink({...newDrink, description: e.target.value})}
                    className="input-field min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newDrink.price}
                      onChange={(e) => setNewDrink({...newDrink, price: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newDrink.category}
                      onChange={(e) => setNewDrink({...newDrink, category: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      value={newDrink.preparation_time}
                      onChange={(e) => setNewDrink({...newDrink, preparation_time: e.target.value})}
                      className="input-field"
                      min="1"
                      max="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newDrink.is_available}
                      onChange={(e) => setNewDrink({...newDrink, is_available: e.target.value === 'true'})}
                      className="input-field"
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Drink Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewDrink({...newDrink, image: e.target.files[0]})}
                    className="input-field"
                  />
                  {selectedDrink?.image && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Current image will be replaced
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Update Drink
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Summary */}
      {drinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="card text-center">
            <div className="text-3xl text-blue-500 mb-2">🥤</div>
            <h4 className="font-bold text-gray-800 dark:text-white">Total Drinks</h4>
            <p className="text-2xl font-bold mt-1">{drinks.length}</p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl text-green-500 mb-2">✅</div>
            <h4 className="font-bold text-gray-800 dark:text-white">Available</h4>
            <p className="text-2xl font-bold mt-1">
              {drinks.filter(d => d.is_available).length}
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl text-yellow-500 mb-2">⏱️</div>
            <h4 className="font-bold text-gray-800 dark:text-white">Avg Prep Time</h4>
            <p className="text-2xl font-bold mt-1">
              {drinks.length > 0 
                ? Math.round(drinks.reduce((sum, d) => sum + (d.preparation_time || 5), 0) / drinks.length)
                : 0} min
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl text-purple-500 mb-2">💰</div>
            <h4 className="font-bold text-gray-800 dark:text-white">Avg Price</h4>
            <p className="text-2xl font-bold mt-1">
              ${drinks.length > 0 
                ? (drinks.reduce((sum, d) => sum + parseFloat(d.price || 0), 0) / drinks.length).toFixed(2)
                : '0.00'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Drinks;