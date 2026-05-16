const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define(
  'Reservation',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    restaurant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reservation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    guest_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    special_request: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'reservations',
    timestamps: true,
    indexes: [
      {
        fields: ['table_id', 'reservation_date', 'status'],
        name: 'idx_table_date_status',
      },
      { fields: ['customer_id'], name: 'idx_customer_id' },
      { fields: ['restaurant_id'], name: 'idx_restaurant_id' },
    ],
  }
);

module.exports = Reservation;