module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    engagement_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  Event.associate = (models) => {
    Event.belongsTo(models.User, { foreignKey: 'organizerId', as: 'organizer' });
    Event.hasMany(models.Registration, { foreignKey: 'eventId', as: 'Registrations' });
  };

  return Event;
};