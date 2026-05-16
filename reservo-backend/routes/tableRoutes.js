const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// Table CRUD routes
router.post('/', tableController.createTable);
router.get('/', tableController.getAllTables);
router.get('/:id', tableController.getTableById);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);

// Restaurant-specific table routes
router.get('/restaurant/:restaurant_id', tableController.getTablesByRestaurant);
router.get('/restaurant/:restaurant_id/available', tableController.getAvailableTablesByRestaurant);

// Update table status
router.patch('/:id/status', tableController.updateTableStatus);

module.exports = router;
