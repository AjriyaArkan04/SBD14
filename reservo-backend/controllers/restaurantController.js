const Restaurant = require('../models/Restaurants');
const Table = require('../models/Table');
const User = require('../models/User');

// Create restaurant (admin only)
exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, address, city, cuisine, phone, opening_time, closing_time, owner_id } = req.body;

    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      city,
      cuisine,
      phone,
      opening_time,
      closing_time,
      owner_id,
    });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json({
      message: 'Restaurants retrieved successfully',
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Table,
          as: 'tables',
        },
      ],
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json({
      message: 'Restaurant retrieved successfully',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, city, cuisine, phone, opening_time, closing_time, is_active } = req.body;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Update fields if provided
    if (name) restaurant.name = name;
    if (description !== undefined) restaurant.description = description;
    if (address) restaurant.address = address;
    if (city) restaurant.city = city;
    if (cuisine !== undefined) restaurant.cuisine = cuisine;
    if (phone !== undefined) restaurant.phone = phone;
    if (opening_time) restaurant.opening_time = opening_time;
    if (closing_time) restaurant.closing_time = closing_time;
    if (is_active !== undefined) restaurant.is_active = is_active;

    await restaurant.save();

    res.status(200).json({
      message: 'Restaurant updated successfully',
      restaurant,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    await restaurant.destroy();

    res.status(200).json({
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get restaurants by city
exports.getRestaurantsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const restaurants = await Restaurant.findAll({
      where: { city, is_active: true },
    });

    res.status(200).json({
      message: `Restaurants in ${city} retrieved successfully`,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
