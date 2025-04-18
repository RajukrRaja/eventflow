const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');
const Event = require('./event.model');

const Registration = sequelize.define('Registration', {
  status: {
    type: DataTypes.ENUM('registered', 'unregistered'),
    defaultValue: 'registered',
  }
});

User.belongsToMany(Event, { through: Registration });
Event.belongsToMany(User, { through: Registration });

module.exports = Registration;
