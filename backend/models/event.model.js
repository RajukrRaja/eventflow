// B:\eventflow\backend\models\Event.js
module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'Events',
      timestamps: true,
    });
  
    Event.associate = (models) => {
      Event.belongsTo(models.User, { foreignKey: 'organizerId', as: 'organizer' });
    };
  
    return Event;
  };