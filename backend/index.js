const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// Test database connection on startup
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

app.get('/', (req, res) => res.send('EventFlow Backend'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));