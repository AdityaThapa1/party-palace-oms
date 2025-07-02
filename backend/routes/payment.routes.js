const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.post('/', isAdmin, controller.create);
router.get('/', isAdmin, controller.findAll);
router.get('/booking/:bookingId', isAdmin, controller.findAllForBooking);
router.delete('/:id', isAdmin, controller.delete);

module.exports = router;