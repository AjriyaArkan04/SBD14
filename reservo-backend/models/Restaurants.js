const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Restaurant = sequelize.define(
  'Restaurant',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cuisine: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g. Indonesian, Japanese, Italian',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    opening_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '08:00:00',
    },
    closing_time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: '22:00:00',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'References users.id (admin who owns this restaurant)',
    },
  },
  {
    tableName: 'restaurants',
    timestamps: true,
  }
);

module.exports = Restaurant;