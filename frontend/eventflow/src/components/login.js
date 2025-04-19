import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic form validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    // Placeholder: No network request; simulate success for now
    setSuccess('Login would be successful if backend were available. Redirecting to home...');
    setTimeout(() => navigate('/'), 2000);
    setIsLoading(false);
  };

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)', transition: { duration: 0.3 } },
    blur: { scale: 1, boxShadow: 'none', transition: { duration: 0.3 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)', transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-6 sm:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 p-8 bg-gray-800/95 dark:bg-gray-700/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-700/30 glassmorphism"
      >
        <h2 className="text-center text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 neon-glow">
          Welcome Back
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-600/95 text-white px-4 py-2 rounded-lg text-sm text-center border border-red-500/50"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-600/95 text-white px-4 py-2 rounded-lg text-sm text-center border border-green-500/50"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={inputVariants} whileFocus="focus" initial="blur">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
            />
          </motion.div>

          <motion.div variants={inputVariants} whileFocus="focus" initial="blur">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all duration-300 neon-hover ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <motion.span
            onClick={() => navigate('/register')}
            className="text-blue-400 hover:text-blue-300 cursor-pointer relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            Register
            <motion.span
              className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ originX: 0 }}
            />
          </motion.span>
        </p>
      </motion.div>

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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

export default Login;