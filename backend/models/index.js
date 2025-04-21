// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user.model')(sequelize, DataTypes);
const AuditLog = require('./auditlog.model')(sequelize, DataTypes);

// Set up associations
User.associate && User.associate({ AuditLog });
AuditLog.associate && AuditLog.associate({ User });

module.exports = {
  sequelize,
  Sequelize,
  User,
  AuditLog,
};
