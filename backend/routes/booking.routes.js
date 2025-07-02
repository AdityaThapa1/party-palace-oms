const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');

// Correctly import ALL required middleware functions
const { 
    verifyToken,          // For Staff/Admins
    isAdmin,              // For Admin-only actions
    verifyCustomerToken   // For Customers
} = require('../middleware/auth.middleware'); 

// ADMIN / STAFF ROUTES
router.post('/admin', [verifyToken], controller.createByAdmin);
router.put('/:id', [verifyToken, isAdmin], controller.update);
router.delete('/:id', [verifyToken, isAdmin], controller.delete);
router.get('/staff', [verifyToken], controller.findAllForStaff);

// CUSTOMER-ONLY SELF-SERVICE ROUTES 
// These routes are for a logged-in customer managing their own data.
router.post('/customer', [verifyCustomerToken], controller.createByCustomer);
router.put('/customer/:id', [verifyCustomerToken], controller.updateByCustomer);
router.delete('/customer/:id', [verifyCustomerToken], controller.deleteByCustomer);


// SHARED / GENERAL ROUTES
router.get('/check-availability', [verifyToken], controller.checkAvailability);
router.get('/', [verifyToken, isAdmin], controller.findAll);
router.get('/:id', [verifyToken], controller.findOne);

module.exports = router;