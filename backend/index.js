const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/user.model');
const Event = require('./models/event.model');
const Registration = require('./models/registration.model');
const Feedback = require('./models/feedback.model');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const feedbackRoutes = require('./routes/feedback.routes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);

sequelize.sync()
  .then(() => console.log('Models synchronized'))
  .catch(err => console.error('Sync error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));