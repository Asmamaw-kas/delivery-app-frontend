import { motion } from 'framer-motion';

const DrinkCard = ({ item, onOrder }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="card hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 md:h-56 mb-3 md:mb-4 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-3xl md:text-5xl">🥤</span>
          </div>
        )}
        {item.is_available ? (
          <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse">
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-red-500 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs font-semibold">
          </span>
        )}
      </div>
      
      <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 truncate">{item.name}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">
        {item.description || 'Refreshing drink'}
      </p>
      
      <div className="flex items-center justify-between mt-3 md:mt-4">
        <div>
          <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
            ${parseFloat(item.price).toFixed(2)}
          </span>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {item.preparation_time} min
          </p>
        </div>
        <button
          onClick={onOrder}
          disabled={!item.is_available}
          className={`px-3 py-1.5 md:px-3 md:py-1 rounded-lg font-semibold transition-colors text-sm md:text-base ${
            item.is_available 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {item.is_available ? 'Order' : 'Sold Out'}
        </button>
      </div>
    </motion.div>
  );
};

export default DrinkCard;