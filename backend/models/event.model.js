const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user.model');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  engagementScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'Events',
  timestamps: false
});

Event.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports = Event;
