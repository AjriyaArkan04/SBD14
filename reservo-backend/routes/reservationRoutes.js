const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Reservation CRUD routes
router.post('/', reservationController.createReservation);
router.get('/', reservationController.getAllReservations);

// Specific routes HARUS di atas /:id
router.get('/customer/:customer_id', reservationController.getReservationsByCustomer);
router.get('/restaurant/:restaurant_id', reservationController.getReservationsByRestaurant);

router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);
router.patch('/:id/confirm', reservationController.confirmReservation);
router.patch('/:id/reject', reservationController.rejectReservation);
router.patch('/:id/cancel', reservationController.cancelReservation);
router.patch('/:id/complete', reservationController.completeReservation);

module.exports = router;