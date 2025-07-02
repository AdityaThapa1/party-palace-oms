const express = require('express');
const router = express.Router();
const controller = require('../controllers/report.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/staff', [verifyToken], controller.getStaffDashboardSummary);
router.use([verifyToken, isAdmin]);
router.get('/bookings', controller.generateBookingsReport);
router.get('/revenue', controller.generateRevenueReport);
router.get('/customers', controller.generateCustomersReport);
router.get('/dashboard-summary', controller.dashboardSummary);


module.exports = router;