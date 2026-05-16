const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Table = sequelize.define(
  'Table',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    table_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'e.g. T-01, VIP-3',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 50 },
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'maintenance'),
      allowNull: false,
      defaultValue: 'available',
    },
    location: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g. indoor, outdoor, VIP room',
    },
  },
  {
    tableName: 'tables',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['restaurant_id', 'table_number'],
        name: 'unique_table_per_restaurant',
      },
    ],
  }
);

module.exports = Table;