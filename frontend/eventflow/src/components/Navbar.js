import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  GlobeAltIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/solid';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Theme and scroll handling
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Authentication check
  useEffect(() => {
    const checkAuth = async (retryCount = 0) => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        setIsAuthenticated(true);
        setUser({
          ...res.data,
          avatar: res.data.avatar || 'https://via.placeholder.com/150',
          eventsAttended: res.data.eventsAttended || 12,
          eventsOrganized: res.data.eventsOrganized || 5
        });
        setError(null);
        const notifRes = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(notifRes.data.unreadCount || 0);
      } catch (err) {
        if (retryCount < 2) {
          setTimeout(() => checkAuth(retryCount + 1), 1000);
          return;
        }
        setError('Authentication failed. Please try again.');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Search functionality
  useEffect(() => {
    const searchEvents = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/events/search?q=${searchQuery}`);
        setSearchResults(res.data.slice(0, 5));
      } catch (err) {
        setError('Failed to fetch search results.');
        setTimeout(() => setError(null), 3000);
      }
    };
    const debounce = setTimeout(searchEvents, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const commonLinks = [
    { to: '/', label: 'Home', translation: { en: 'Home', es: 'Inicio' } },
    { to: '/events', label: 'Events', translation: { en: 'Events', es: 'Eventos' } },
    { to: '/about', label: 'About', translation: { en: 'About', es: 'Acerca' } },
    { to: '/contact', label: 'Contact', translation: { en: 'Contact', es: 'Contacto' } }
  ];

  const menuVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, x: '100%', transition: { duration: 0.4, ease: 'easeIn' } }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
  };

  const profileVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, type: 'spring', stiffness: 100 } }
  };

  const searchVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <nav className={`bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 bg-opacity-95 dark:bg-opacity-95 backdrop-blur-2xl shadow-lg sticky top-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'shadow-2xl' : 'shadow-xl'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex-shrink-0">
              <motion.span
                className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 dark:from-blue-300 dark:via-purple-400 dark:to-pink-400 neon-glow"
                whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(59, 130, 246, 0.9)' }}
                transition={{ duration: 0.3 }}
              >
                EventFlow
              </motion.span>
            </Link>
            <div className="hidden sm:flex items-center space-x-8">
              {commonLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-2 rounded-lg text-base font-semibold text-white dark:text-gray-100 hover:text-blue-300 dark:hover:text-blue-200 transition-all duration-300 group"
                >
                  {link.translation[language]}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{ originX: 0 }}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full text-blue-400 dark:text-blue-300 bg-blue-700/20 dark:bg-blue-600/20 hover:bg-blue-700/40 dark:hover:bg-blue-600/40 transition-all duration-300"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full text-blue-400 dark:text-blue-300 bg-blue-700/20 dark:bg-blue-600/20 hover:bg-blue-700/40 dark:hover:bg-blue-600/40 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeLanguage(language === 'en' ? 'es' : 'en')}
              className="p-2 rounded-full text-blue-400 dark:text-blue-300 bg-blue-700/20 dark:bg-blue-600/20 hover:bg-blue-700/40 dark:hover:bg-blue-600/40 transition-all duration-300"
              aria-label="Change language"
            >
              <GlobeAltIcon className="h-6 w-6" />
            </motion.button>

            {isAuthenticated && user && (
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white dark:text-gray-100 bg-gradient-to-r from-blue-700/30 to-purple-700/30 hover:from-blue-700/50 hover:to-purple-700/50 transition-all duration-300 neon-hover"
                >
                  <UserCircleIcon className="h-7 w-7 mr-2 text-blue-400 dark:text-blue-300 transition-transform duration-300 group-hover:scale-110" />
                  <span>{user.full_name}</span>
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, transition: { type: 'spring', stiffness: 200 } }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {notifications}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      variants={profileVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute right-0 mt-3 w-80 bg-gray-800/95 dark:bg-gray-700/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden"
                    >
                      {/* User Profile Card */}
                      <div className="p-6 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
                        <div className="flex items-center space-x-4">
                          <motion.img
                            src={user.avatar}
                            alt="User avatar"
                            className="w-16 h-16 rounded-full border-2 border-blue-400/50 object-cover"
                            whileHover={{ scale: 1.1, borderColor: 'rgba(59, 130, 246, 0.8)' }}
                            transition={{ duration: 0.3 }}
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white dark:text-gray-100">{user.full_name}</h3>
                            <p className="text-sm text-gray-400 capitalize">{user.role}</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-white">{user.eventsAttended}</p>
                              <p className="text-xs text-gray-400">Events Attended</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TicketIcon className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-sm font-medium text-white">{user.eventsOrganized}</p>
                              <p className="text-xs text-gray-400">Events Organized</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to={user.role === 'organizer' ? '/organizer/dashboard' : '/attendee/dashboard'}
                          className="block px-6 py-3 text-sm font-medium text-gray-200 hover:bg-blue-600/40 hover:text-white transition-all duration-300"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          {user.role === 'organizer' ? 'Organizer Dashboard' : 'Attendee Dashboard'}
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-6 py-3 text-sm font-medium text-gray-200 hover:bg-blue-600/40 hover:text-white transition-all duration-300"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <Link
                          to="/notifications"
                          className="block px-6 py-3 text-sm font-medium text-gray-200 hover:bg-blue-600/40 hover:text-white transition-all duration-300"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Notifications
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-200 hover:bg-red-600/40 hover:text-white transition-all duration-300"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!isAuthenticated && (
              <>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white dark:text-gray-100 bg-blue-600/30 dark:bg-blue-500/30 hover:bg-blue-600/50 dark:hover:bg-blue-500/50 transition-all duration-300 neon-hover"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 neon-hover"
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Hamburger for mobile */}
          <div className="sm:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-full text-blue-400 dark:text-blue-300 bg-blue-700/20 dark:bg-blue-600/20 hover:bg-blue-700/40 dark:hover:bg-blue-600/40 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-8 w-8 transform transition-transform duration-500 rotate-180" />
              ) : (
                <Bars3Icon className="h-8 w-8 transform transition-transform duration-500" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            variants={searchVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-20 left-0 right-0 bg-gray-800/95 dark:bg-gray-700/95 backdrop-blur-2xl mx-4 sm:mx-6 lg:mx-8 rounded-2xl shadow-2xl border border-gray-700/30"
            ref={searchRef}
          >
            <div className="p-5">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-700/50 dark:bg-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 max-h-80 overflow-y-auto rounded-lg bg-gray-800/50">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      to={`/events/${result.id}`}
                      className="block px-5 py-4 text-sm text-gray-200 hover:bg-blue-600/40 hover:text-white transition-all duration-300 border-b border-gray-700/30 last:border-b-0"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-gray-400">{result.date}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="sm:hidden fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 bg-opacity-95 backdrop-blur-2xl z-40 overflow-y-auto"
          >
            <div className="pt-28 pb-12 px-8 space-y-5">
              {commonLinks.map((link) => (
                <motion.div key={link.to} variants={menuItemVariants}>
                  <Link
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gray-800/30 dark:bg-gray-700/30 hover:bg-blue-700/50 dark:hover:bg-blue-600/50 transition-all duration-300 neon-hover"
                  >
                    {link.translation[language]}
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated && user ? (
                <>
                  {/* Mobile Profile Card */}
                  <motion.div variants={menuItemVariants} className="bg-gray-800/50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-700/30">
                    <div className="flex items-center space-x-4">
                      <motion.img
                        src={user.avatar}
                        alt="User avatar"
                        className="w-12 h-12 rounded-full border-2 border-blue-400/50 object-cover"
                        whileHover={{ scale: 1.1, borderColor: 'rgba(59, 130, 246, 0.8)' }}
                        transition={{ duration: 0.3 }}
                      />
                      <div>
                        <h3 className="text-base font-semibold text-white dark:text-gray-100">{user.full_name}</h3>
                        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{user.eventsAttended}</p>
                          <p className="text-xs text-gray-400">Events Attended</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TicketIcon className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{user.eventsOrganized}</p>
                          <p className="text-xs text-gray-400">Events Organized</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to={user.role === 'organizer' ? '/organizer/dashboard' : '/attendee/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gray-800/30 dark:bg-gray-700/30 hover:bg-blue-700/50 dark:hover:bg-blue-600/50 transition-all duration-300 neon-hover"
                    >
                      {user.role === 'organizer' ? 'Organizer Dashboard' : 'Attendee Dashboard'}
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gray-800/30 dark:bg-gray-700/30 hover:bg-blue-700/50 dark:hover:bg-blue-600/50 transition-all duration-300 neon-hover"
                    >
                      Profile Settings
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gray-800/30 dark:bg-gray-700/30 hover:bg-blue-700/50 dark:hover:bg-blue-600/50 transition-all duration-300 neon-hover"
                    >
                      Notifications
                      {notifications > 0 && (
                        <span className="ml-3 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                          {notifications}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItemVariants}>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-red-600/50 hover:bg-red-700/70 transition-all duration-300 neon-hover"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-blue-600/30 dark:bg-blue-500/30 hover:bg-blue-600/50 dark:hover:bg-blue-500/50 transition-all duration-300 neon-hover"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div variants={menuItemVariants}>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 neon-hover"
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
              <motion.div variants={menuItemVariants} className="pt-8 border-t border-gray-700/50">
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gray-800/30 dark:bg-gray-700/30 hover:bg-blue-700/50 dark:hover:bg-blue-600/50 transition-all duration-300 neon-hover"
                >
                  {isDarkMode ? (
                    <>
                      <SunIcon className="h-7 w-7 mr-3" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-7 w-7 mr-3" />
                      Dark Mode
                    </>
                  )}
                </button>
              </motion.div>
              <motion.div variants={menuItemVariants}>
                <button
                  onClick={() => {
                    changeLanguage(language === 'en' ? 'es' : 'en');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-6 py-4 rounded-2xl text-lg font-semibold text-white dark:text-gray-100 bg-gray-800/30 dark:bg-gray-700/30 hover:bg-blue-700/50 dark:hover:bg-blue-600/50 transition-all duration-300 neon-hover"
                >
                  <GlobeAltIcon className="h-7 w-7 mr-3" />
                  {language === 'en' ? 'Español' : 'English'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 bg-red-600/95 text-white px-6 py-3 rounded-2xl shadow-2xl border border-red-500/50 z-50 backdrop-blur-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-14 w-14 border-4 border-gradient-to-r from-blue-400 to-purple-500 border-t-transparent rounded-full"
            ></motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Custom Tailwind CSS for professional design and effects
const styles = `
  .neon-hover:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.7), 
                0 0 30px rgba(59, 130, 246, 0.5),
                0 0 40px rgba(59, 130, 246, 0.3);
    transform: translateY(-2px);
  }
  .neon-glow {
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.9), 
                 0 0 20px rgba(59, 130, 246, 0.6),
                 0 0 30px rgba(59, 130, 246, 0.4);
  }
  .dark .neon-glow {
    text-shadow: 0 0 12px rgba(59, 130, 246, 1), 
                 0 0 25px rgba(59, 130, 246, 0.8),
                 0 0 35px rgba(59, 130, 246, 0.5);
  }
  .glassmorphism {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .gradient-border {
    border-image: linear-gradient(to right, #3b82f6, #a855f7) 1;
  }
`;

export default Navbar;