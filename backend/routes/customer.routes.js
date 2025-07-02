const express = require('express');
const router = express.Router();
const controller = require('../controllers/customer.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// PUBLIC CUSTOMER-FACING AUTH ROUTES 
router.post('/register', controller.register);
router.post('/login', controller.login);

// PROTECTED CUSTOMER ROUTE (Requires Customer Token) 
router.get('/my-bookings', verifyToken, controller.getMyBookings);


// STAFF/ADMIN-ONLY ROUTES for managing ALL customers (Requires Staff/Admin Token) 
router.post('/', verifyToken, controller.create);
router.get('/', verifyToken, controller.findAll);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);

module.exports = router;