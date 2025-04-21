module.exports = (sequelize, DataTypes) => {
    const Registration = sequelize.define('Registration', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Events', key: 'id' },
      },
      confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      feedbackScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
  
    Registration.associate = (models) => {
      Registration.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
    };
  
    return Registration;
  };