const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model'); // FK to User

const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// Association
User.hasMany(Event, { foreignKey: 'created_by' });
Event.belongsTo(User, { foreignKey: 'created_by' });

module.exports = Event;
