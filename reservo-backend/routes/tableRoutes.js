const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// Table CRUD routes
router.post('/', tableController.createTable);
router.get('/', tableController.getAllTables);

// Restaurant-specific routes HARUS di atas /:id
router.get('/restaurant/:restaurant_id/available', tableController.getAvailableTablesByRestaurant);
router.get('/restaurant/:restaurant_id', tableController.getTablesByRestaurant);
router.get('/restaurant/:restaurant_id/schedule', tableController.getTableSchedule);
router.get('/:id', tableController.getTableById);
router.put('/:id', tableController.updateTable);
router.delete('/:id', tableController.deleteTable);
router.patch('/:id/status', tableController.updateTableStatus);

module.exports = router;