// Centralized model exports
const User = require('./User');
const Restaurant = require('./Restaurants');
const Table = require('./Table');
const Reservation = require('./Reservation');

// Define associations
// User associations
User.hasMany(Restaurant, { foreignKey: 'owner_id', as: 'restaurants' });
User.hasMany(Reservation, { foreignKey: 'customer_id', as: 'reservations' });

// Restaurant associations
Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Restaurant.hasMany(Table, { foreignKey: 'restaurant_id', as: 'tables' });
Restaurant.hasMany(Reservation, { foreignKey: 'restaurant_id', as: 'reservations' });

// Table associations
Table.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
Table.hasMany(Reservation, { foreignKey: 'table_id', as: 'reservations' });

// Reservation associations
Reservation.belongsTo(User, { foreignKey: 'customer_id', as: 'User' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'Restaurant' });
Reservation.belongsTo(Table, { foreignKey: 'table_id', as: 'Table' });

module.exports = {
  User,
  Restaurant,
  Table,
  Reservation,
};
