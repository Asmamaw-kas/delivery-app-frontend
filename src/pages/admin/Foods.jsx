import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaHamburger } from 'react-icons/fa';
import menuApi from '../../api/menuApi';
import { toast } from 'react-hot-toast';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [categories, setCategories] = useState([]);

  // New food form
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparation_time: 15,
    is_available: true,
    image: null,
  });

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await menuApi.getMenuItems();
      const items = response.data.results || response.data || [];
      const foodItems = items.filter(item => 
        item.category_type === 'food' || item.category?.category_type === 'food'
      );
      setFoods(foodItems);
    } catch (error) {
      toast.error('Failed to load foods');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await menuApi.getCategories();
      const foodCategories = (response.data.results || response.data || [])
        .filter(cat => cat.category_type === 'food');
      setCategories(foodCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

    const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newFood.name);
      formData.append('description', newFood.description);
      formData.append('price', newFood.price);
      formData.append('category', newFood.category);
      formData.append('preparation_time', newFood.preparation_time);
      formData.append('is_available', newFood.is_available);
      if (newFood.image) {
        formData.append('image', newFood.image);
      }

      await menuApi.createMenuItem(formData);
      toast.success('Food item added successfully');
      setShowAddModal(false);
      resetForm();
      fetchFoods();
    } catch (error) {
      console.error('Create error:', error.response?.data);
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.name?.[0] 
        || 'Failed to add food item';
      toast.error(errorMessage);
    }
  };


  const handleUpdateFood = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;
    
    try {
      const formData = new FormData();
      formData.append('name', newFood.name);
      formData.append('description', newFood.description);
      formData.append('price', newFood.price);
      formData.append('category', newFood.category);
      formData.append('preparation_time', newFood.preparation_time);
      formData.append('is_available', newFood.is_available);
      
      // ✅ ONLY append image if a new one was selected
      if (newFood.image) {
        formData.append('image', newFood.image);
      }

      await menuApi.updateMenuItem(selectedFood.id, formData);
      toast.success('Food item updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchFoods();
    } catch (error) {
      console.error('Update error:', error.response?.data); // ✅ Better error logging
      toast.error(error.response?.data?.detail || 'Failed to update food item');
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    
    try {
      await menuApi.deleteMenuItem(id);
      toast.success('Food item deleted');
      fetchFoods();
    } catch (error) {
      toast.error('Failed to delete food item');
    }
  };

  const resetForm = () => {
    setNewFood({
      name: '',
      description: '',
      price: '',
      category: '',
      preparation_time: 15,
      is_available: true,
      image: null,
    });
    setSelectedFood(null);
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading foods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Foods Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredFoods.length} food items
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FaPlus />
          Add New Food
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card hover:shadow-xl transition-shadow"
          >
            <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
              {food.image ? (
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-purple-100 dark:from-orange-900 dark:to-purple-900 flex items-center justify-center">
                  <FaHamburger className="text-4xl text-orange-500 dark:text-orange-400" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  food.is_available
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {food.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{food.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {food.description || 'No description'}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${parseFloat(food.price).toFixed(2)}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {food.preparation_time} min prep
                  </p>
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {food.category_type || 'Food'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`/menu/items/${food.id}`, '_blank')}
                  className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaEye />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedFood(food);
                    setNewFood({
                      name: food.name,
                      description: food.description || '',
                      price: food.price,
                      category: food.category?.id || '',
                      preparation_time: food.preparation_time || 15,
                      is_available: food.is_available,
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
                  onClick={() => handleDeleteFood(food.id)}
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
      {filteredFoods.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍔</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No food items found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try a different search term' : 'Add your first food item'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Add New Food
          </button>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Food</h2>
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

              <form onSubmit={handleAddFood} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newFood.description}
                    onChange={(e) => setNewFood({...newFood, description: e.target.value})}
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
                      value={newFood.price}
                      onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newFood.category}
                      onChange={(e) => setNewFood({...newFood, category: e.target.value})}
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
                      value={newFood.preparation_time}
                      onChange={(e) => setNewFood({...newFood, preparation_time: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newFood.is_available}
                      onChange={(e) => setNewFood({...newFood, is_available: e.target.value === 'true'})}
                      className="input-field"
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Food Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewFood({...newFood, image: e.target.files[0]})}
                    className="input-field"
                  />
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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Add Food
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Food Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Food</h2>
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

              <form onSubmit={handleUpdateFood} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newFood.description}
                    onChange={(e) => setNewFood({...newFood, description: e.target.value})}
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
                      value={newFood.price}
                      onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={newFood.category}
                      onChange={(e) => setNewFood({...newFood, category: e.target.value})}
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
                      value={newFood.preparation_time}
                      onChange={(e) => setNewFood({...newFood, preparation_time: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={newFood.is_available}
                      onChange={(e) => setNewFood({...newFood, is_available: e.target.value === 'true'})}
                      className="input-field"
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Food Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewFood({...newFood, image: e.target.files[0]})}
                    className="input-field"
                  />
                  {selectedFood?.image && (
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
                    Update Food
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Foods;