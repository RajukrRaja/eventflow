const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/user.routes');
const eventRoutes = require('./routes/event.routes');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Routes
app.use('/api/users', authRoutes);
app.use('/api/events', eventRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ message: 'Server error' });
});

// Sync database and start server
const PORT = process.env.PORT || 5000;

console.log('🔄 Connecting with DB:', {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`Unable to connect to the database: ${error.message}`);
    process.exit(1);
  });