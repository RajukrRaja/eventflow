const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  userId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'user_id' }
  },
  engagementScore: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'events', timestamps: false });

Event.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = Event;