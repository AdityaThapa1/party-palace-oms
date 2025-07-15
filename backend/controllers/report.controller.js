const db = require('../models');
const { Op, fn, col } = require('sequelize');
const { format, parseISO, startOfDay, endOfDay, subMonths } = require('date-fns');
const PDFDocument = require('pdfkit-table');
const { createObjectCsvWriter, createObjectCsvStringifier } = require('csv-writer');

const { Booking, Customer, Payment, User, Inventory } = db;

// Helper function to create a standardized filename.
const createFilename = (reportName, fileType) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    return `${reportName}-report-${timestamp}.${fileType}`;
};

// Dashboard Summary Controller
exports.dashboardSummary = async (req, res) => {
    try {
        const todayStart = startOfDay(new Date());
        const totalBookingsPromise = Booking.count().catch(() => 0);
        const totalRevenuePromise = Payment.sum('amount').catch(() => 0);
        const upcomingEventsPromise = Booking.count({ where: { eventDate: { [Op.gte]: todayStart }, status: 'Confirmed' } }).catch(() => 0);
        const lowStockItemsPromise = Inventory.count({ where: { quantity: { [Op.lte]: col('lowStockThreshold') } } }).catch(() => 0);
        const revenueByMonthPromise = Payment.findAll({ attributes: [[fn('YEAR', col('paymentDate')), 'year'], [fn('MONTH', col('paymentDate')), 'month'], [fn('SUM', col('amount')), 'total']], where: { paymentDate: { [Op.gte]: subMonths(new Date(), 6) } }, group: ['year', 'month'], order: [[col('year'), 'ASC'], [col('month'), 'ASC']], raw: true }).catch(() => []);
        
        const [totalBookings, totalRevenue, upcomingEvents, lowStockItems, revenueByMonth] = await Promise.all([totalBookingsPromise, totalRevenuePromise, upcomingEventsPromise, lowStockItemsPromise, revenueByMonthPromise]);

        res.status(200).send({ totalBookings, totalRevenue: totalRevenue || 0, upcomingEvents, lowStockItems, revenueByMonth });
    } catch (error) {
        console.error("DASHBOARD SUMMARY CRITICAL ERROR:", error);
        res.status(500).send({ message: "Error fetching dashboard summary data." });
    }
};

// Generates a detailed report of all bookings 
exports.generateBookingsReport = async (req, res) => {
    const { format: reportFormat = 'pdf', status, startDate, endDate } = req.query;
    try {
        const whereClause = {};
        if (status) whereClause.status = status;
        if (startDate && endDate) { whereClause.eventDate = { [Op.between]: [startOfDay(parseISO(startDate)), endOfDay(parseISO(endDate))] }; }

        const bookings = await Booking.findAll({
            where: whereClause,
            include: [{ model: Customer, as: 'customer' }, { model: User, as: 'handler' }],
            order: [['eventDate', 'ASC']],
            raw: true,
            nest: true
        });

        const records = bookings.map(b => ({
            eventType: b.eventType,
            eventDate: format(new Date(b.eventDate), 'yyyy-MM-dd'),
            status: b.status,
            guestCount: b.guestCount,
            totalAmount: b.totalAmount,
            customerName: b.customer?.name || 'N/A',
            handlerName: b.handler?.name || 'N/A'
        }));

        if (reportFormat.toLowerCase() === 'csv') {
            const csvStringifier = createObjectCsvStringifier({
                header: [
                    { id: 'eventType', title: 'EVENT' }, { id: 'eventDate', title: 'DATE' }, { id: 'status', title: 'STATUS' },
                    { id: 'guestCount', title: 'GUESTS' }, { id: 'totalAmount', title: 'AMOUNT_RS' },
                    { id: 'customerName', title: 'CUSTOMER' }, { id: 'handlerName', title: 'HANDLED_BY' }
                ]
            });
            const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${createFilename('bookings', 'csv')}`);
            return res.status(200).send(csvString);
        }

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${createFilename('bookings', 'pdf')}`);
        doc.pipe(res);
        const table = {
            title: "Bookings Report",
            headers: ["Event", "Date", "Status", "Guests", "Amount", "Customer", "Handled By"],
            rows: records.map(r => [r.eventType, r.eventDate, r.status, r.guestCount, parseFloat(r.totalAmount).toLocaleString(), r.customerName, r.handlerName])
        };
        await doc.table(table);
        doc.end();

    } catch (error) {
        console.error("Failed to generate bookings report:", error);
        res.status(500).send({ message: 'Failed to generate bookings report.' });
    }
};

//Generates a detailed report of all revenue/payments
exports.generateRevenueReport = async (req, res) => {
    const { format: reportFormat = 'pdf', startDate, endDate } = req.query;
    try {
        const whereClause = {};
        if (startDate && endDate) { whereClause.paymentDate = { [Op.between]: [startOfDay(parseISO(startDate)), endOfDay(parseISO(endDate))] }; }
        const payments = await Payment.findAll({ where: whereClause, include: [{ model: Booking, as: 'Booking', include: [{ model: Customer, as: 'customer' }] }], order: [['paymentDate', 'ASC']], raw: true, nest: true });
        const records = payments.map(p => ({ paymentDate: format(new Date(p.paymentDate), 'yyyy-MM-dd'), amount: p.amount, method: p.method, eventType: p.Booking?.eventType || 'N/A', customerName: p.Booking?.customer?.name || 'N/A' }));
        const totalRevenue = records.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        if (reportFormat.toLowerCase() === 'csv') {
             const csvStringifier = createObjectCsvStringifier({
                 header: [{ id: 'paymentDate', title: 'DATE' }, { id: 'amount', title: 'AMOUNT_RS' }, { id: 'method', title: 'METHOD' }, { id: 'eventType', title: 'EVENT' }, { id: 'customerName', title: 'CUSTOMER' }]
             });
             const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
             res.setHeader('Content-Type', 'text/csv');
             res.setHeader('Content-Disposition', `attachment; filename=${createFilename('revenue', 'csv')}`);
             return res.status(200).send(csvString);
        }

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${createFilename('revenue', 'pdf')}`);
        doc.pipe(res);
        const table = { title: "Revenue Report", subtitle: `Total Revenue: Rs. ${totalRevenue.toLocaleString()}`, headers: ["Date", "Amount", "Method", "Event", "Customer"], rows: records.map(r => [r.paymentDate, parseFloat(r.amount).toLocaleString(), r.method, r.eventType, r.customerName]) };
        await doc.table(table);
        doc.end();

    } catch (error) {
        console.error("Failed to generate revenue report:", error);
        res.status(500).send({ message: 'Failed to generate revenue report.' });
    }
};

// Generates a report of all customers
exports.generateCustomersReport = async (req, res) => {
    const { format: reportFormat = 'pdf' } = req.query;
    try {
        const customers = await Customer.findAll({ attributes: ['name', 'email', 'phone', 'address', [fn('COUNT', col('Bookings.id')), 'bookingCount']], include: [{ model: Booking, as: 'Bookings', attributes: [] }], group: ['Customer.id'], order: [['name', 'ASC']], raw: true });

        if (reportFormat.toLowerCase() === 'csv') {
            const csvStringifier = createObjectCsvStringifier({
                header: [ { id: 'name', title: 'NAME' }, { id: 'email', title: 'EMAIL' }, { id: 'phone', title: 'PHONE' }, { id: 'address', title: 'ADDRESS' }, { id: 'bookingCount', title: 'TOTAL_BOOKINGS' }]
            });
            const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(customers);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${createFilename('customers', 'csv')}`);
            return res.status(200).send(csvString);
        }
        
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${createFilename('customers', 'pdf')}`);
        doc.pipe(res);
        const table = { title: "Customer Report", headers: ["Name", "Email", "Phone", "Bookings"], rows: customers.map(c => [c.name, c.email, c.phone, c.bookingCount]) };
        await doc.table(table);
        doc.end();

    } catch (error) {
        console.error("Failed to generate customers report:", error);
        res.status(500).send({ message: 'Failed to generate customers report.' });
    }
};

exports.getStaffDashboardSummary = async (req, res) => {
    try {
        const todayStart = startOfDay(new Date());

        // Define promises for the queries staff can run
        const totalBookingsPromise = Booking.count().catch(() => 0);
        const upcomingEventsPromise = Booking.count({
            where: { eventDate: { [Op.gte]: todayStart }, status: 'Confirmed' }
        }).catch(() => 0);
        const lowStockItemsPromise = Inventory.count({
            where: { quantity: { [Op.lte]: col('lowStockThreshold') } }
        }).catch(() => 0);

        // Await all promises
        const [totalBookings, upcomingEvents, lowStockItems] = await Promise.all([
            totalBookingsPromise,
            upcomingEventsPromise,
            lowStockItemsPromise
        ]);

        // Send back only the data the staff dashboard needs
        res.status(200).send({
            totalBookings,
            upcomingEvents,
            lowStockItems,
        });

    } catch (error) {
        console.error("STAFF DASHBOARD SUMMARY ERROR:", error);
        res.status(500).send({ message: "Error fetching staff dashboard data." });
    }
};