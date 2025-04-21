// models/auditlog.model.js
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    performedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'AuditLogs',
    timestamps: true, // Automatically adds createdAt/updatedAt
  });

  return AuditLog;
};
