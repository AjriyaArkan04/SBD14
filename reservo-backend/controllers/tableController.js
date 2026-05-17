const { Table, Restaurant } = require('../models');

// Create table
exports.createTable = async (req, res) => {
  try {
    const { restaurant_id, table_number, capacity, status, location } = req.body;

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const table = await Table.create({
      restaurant_id,
      table_number,
      capacity,
      status: status || 'available',
      location,
    });

    res.status(201).json({
      message: 'Table created successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tables
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.findAll({
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    res.status(200).json({
      message: 'Tables retrieved successfully',
      tables,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get table by ID
exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id, {
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address', 'city'],
        },
      ],
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.status(200).json({
      message: 'Table retrieved successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tables by restaurant
exports.getTablesByRestaurant = async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const tables = await Table.findAll({
      where: { restaurant_id },
    });

    res.status(200).json({
      message: 'Tables retrieved successfully',
      tables,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available tables by restaurant
exports.getAvailableTablesByRestaurant = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { capacity, date, start_time, end_time } = req.query;
    const { Op } = require('sequelize');

    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Cari table yang punya confirmed/pending reservation yang overlap
    let bookedTableIds = [];
    if (date && start_time && end_time) {
      const { Reservation } = require('../models');
      const booked = await Reservation.findAll({
        where: {
          restaurant_id,
          reservation_date: date,
          status: { [Op.in]: ['pending', 'confirmed'] },
          [Op.or]: [
            {
              start_time: { [Op.lt]: end_time },
              end_time: { [Op.gt]: start_time },
            },
          ],
        },
        attributes: ['table_id'],
      });
      bookedTableIds = booked.map((r) => r.table_id);
    }

    const tables = await Table.findAll({
      where: {
        restaurant_id,
        status: { [Op.ne]: 'maintenance' },
        ...(capacity && { capacity: { [Op.gte]: Number(capacity) } }),
        ...(bookedTableIds.length > 0 && { id: { [Op.notIn]: bookedTableIds } }),
      },
    });

    res.status(200).json({
      message: 'Available tables retrieved successfully',
      tables,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update table
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, capacity, status, location } = req.body;

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Update fields if provided
    if (table_number) table.table_number = table_number;
    if (capacity) table.capacity = capacity;
    if (status) table.status = status;
    if (location !== undefined) table.location = location;

    await table.save();

    res.status(200).json({
      message: 'Table updated successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete table
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    await table.destroy();

    res.status(200).json({
      message: 'Table deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update table status
exports.updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'reserved', 'maintenance'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    table.status = status;
    await table.save();

    res.status(200).json({
      message: 'Table status updated successfully',
      table,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTableSchedule = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: 'Date is required' });

    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const { Reservation } = require('../models');
    const { Op } = require('sequelize');

    const tables = await Table.findAll({
      where: { restaurant_id },
    });

    const reservations = await Reservation.findAll({
      where: {
        restaurant_id,
        reservation_date: date,
        status: { [Op.in]: ['pending', 'confirmed'] },
      },
      attributes: ['table_id', 'start_time', 'end_time', 'status'],
    });

    res.status(200).json({
      message: 'Schedule retrieved successfully',
      restaurant: {
        opening_time: restaurant.opening_time,
        closing_time: restaurant.closing_time,
      },
      tables,
      reservations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};