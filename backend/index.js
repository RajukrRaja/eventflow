const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const User = require('./models/user.model');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: false });
    console.log('Models synchronized');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
})();

app.get('/', (req, res) => res.send('EventFlow Backend is running'));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
