const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Restaurant = require('../models/Restaurants');
const Table = require('../models/Table');
const { Op } = require('sequelize');

// Create reservation
exports.createReservation = async (req, res) => {
  try {
    const { customer_id, restaurant_id, table_id, reservation_date, start_time, end_time, guest_count, special_request } = req.body;

    // Verify customer exists
    const customer = await User.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Verify table exists and belongs to restaurant
    const table = await Table.findByPk(table_id);
    if (!table || table.restaurant_id !== restaurant_id) {
      return res.status(404).json({ error: 'Table not found in this restaurant' });
    }

    // Check if table has enough capacity
    if (table.capacity < guest_count) {
      return res.status(400).json({ error: 'Table capacity is not enough for the guest count' });
    }

    // Check for conflicting reservations
    const conflictingReservation = await Reservation.findOne({
      where: {
        table_id,
        reservation_date,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          {
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time },
          },
        ],
      },
    });

    if (conflictingReservation) {
      return res.status(409).json({ error: 'Table is already reserved for the selected time' });
    }

    const reservation = await Reservation.create({
      customer_id,
      restaurant_id,
      table_id,
      reservation_date,
      start_time,
      end_time,
      guest_count,
      special_request,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address'],
        },
        {
          model: Table,
          attributes: ['id', 'table_number', 'capacity'],
        },
      ],
    });

    res.status(200).json({
      message: 'Reservations retrieved successfully',
      reservations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address', 'city'],
        },
        {
          model: Table,
          attributes: ['id', 'table_number', 'capacity', 'location'],
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.status(200).json({
      message: 'Reservation retrieved successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by customer
exports.getReservationsByCustomer = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const customer = await User.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const reservations = await Reservation.findAll({
      where: { customer_id },
      include: [
        {
          model: Restaurant,
          attributes: ['id', 'name', 'address', 'city'],
        },
        {
          model: Table,
          attributes: ['id', 'table_number', 'capacity'],
        },
      ],
      order: [['reservation_date', 'DESC']],
    });

    res.status(200).json({
      message: 'Customer reservations retrieved successfully',
      reservations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reservations by restaurant
exports.getReservationsByRestaurant = async (req, res) => {
  try {
    const { restaurant_id } = req.params;

    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const reservations = await Reservation.findAll({
      where: { restaurant_id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Table,
          attributes: ['id', 'table_number', 'capacity'],
        },
      ],
      order: [['reservation_date', 'DESC']],
    });

    res.status(200).json({
      message: 'Restaurant reservations retrieved successfully',
      reservations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirm reservation (admin only)
exports.confirmReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending reservations can be confirmed' });
    }

    reservation.status = 'confirmed';
    reservation.confirmed_at = new Date();
    await reservation.save();

    res.status(200).json({
      message: 'Reservation confirmed successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject reservation (admin only)
exports.rejectReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending reservations can be rejected' });
    }

    reservation.status = 'rejected';
    reservation.rejection_reason = rejection_reason;
    await reservation.save();

    res.status(200).json({
      message: 'Reservation rejected successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!['pending', 'confirmed'].includes(reservation.status)) {
      return res.status(400).json({ error: 'Only pending or confirmed reservations can be cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete reservation
exports.completeReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({ error: 'Only confirmed reservations can be completed' });
    }

    reservation.status = 'completed';
    await reservation.save();

    res.status(200).json({
      message: 'Reservation completed successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reservation_date, start_time, end_time, guest_count, special_request } = req.body;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!['pending', 'confirmed'].includes(reservation.status)) {
      return res.status(400).json({ error: 'Cannot update reservation with this status' });
    }

    // Check if table has enough capacity
    if (guest_count) {
      const table = await Table.findByPk(reservation.table_id);
      if (table.capacity < guest_count) {
        return res.status(400).json({ error: 'Table capacity is not enough for the guest count' });
      }
    }

    // Update fields if provided
    if (reservation_date) reservation.reservation_date = reservation_date;
    if (start_time) reservation.start_time = start_time;
    if (end_time) reservation.end_time = end_time;
    if (guest_count) reservation.guest_count = guest_count;
    if (special_request !== undefined) reservation.special_request = special_request;

    await reservation.save();

    res.status(200).json({
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete reservation
exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    await reservation.destroy();

    res.status(200).json({
      message: 'Reservation deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
