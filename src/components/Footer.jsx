const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              GetemCafe
            </h3>
            <p className="text-gray-400">
              Delivering delicious food and drinks straight to your doorstep since 2024.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/menu" className="text-gray-400 hover:text-white transition-colors">Menu</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📍 123 Cafe Street, Food City</li>
              <li>📞 +1 234 567 8900</li>
              <li>✉️ info@cafedelights.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Mon-Fri: 8:00 AM - 11:00 PM</li>
              <li>Saturday: 9:00 AM - 12:00 AM</li>
              <li>Sunday: 9:00 AM - 10:00 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CaféDelights Delivery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;