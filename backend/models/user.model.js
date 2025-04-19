const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100] // Ensure name is between 2 and 100 characters
    },
    set(value) {
      this.setDataValue('full_name', value.trim()); // Trim whitespace
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Email address is already in use.'
    },
    validate: {
      isEmail: { msg: 'Please provide a valid email address.' },
      notEmpty: true
    },
    set(value) {
      this.setDataValue('email', value.trim().toLowerCase()); // Normalize email
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 255], // Minimum 8 characters for security
      isStrongPassword(value) {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
        }
      }
    }
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/150', // Default placeholder image
    validate: {
      isUrl: { msg: 'Please provide a valid URL for the avatar.' }
    }
  },
  role: {
    type: DataTypes.ENUM('attendee', 'organizer'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['attendee', 'organizer']],
        msg: 'Role must be either "attendee" or "organizer".'
      }
    }
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true, // Enable createdAt and updatedAt
  paranoid: true, // Enable soft deletes with deletedAt
  indexes: [
    {
      unique: true,
      fields: ['email'] // Index for faster email lookups
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      } catch (err) {
        throw new Error('Error hashing password: ' + err.message);
      }
    },
    beforeUpdate: async (user) => {
      try {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      } catch (err) {
        throw new Error('Error hashing updated password: ' + err.message);
      }
    }
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error('Error comparing passwords: ' + err.message);
  }
};

module.exports = User;