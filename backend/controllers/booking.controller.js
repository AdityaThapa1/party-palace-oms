const db = require('../models');
const { Op } = require('sequelize');
const { Booking, Customer, User, Payment } = db;
const SELF_SERVE_USER_ID = process.env.SELF_SERVE_USER_ID || 2; 


exports.createByCustomer = async (req, res) => {
    const customerId = req.userId; // Sourced from customer's auth token
    if (req.userRole !== 'Customer') {
        return res.status(403).send({ message: "Forbidden: This action is for customers only." });
    }
    const { eventType, eventDate, startTime, endTime, guestCount, totalAmount, notes, mealPlan } = req.body;
    
    try {
        const booking = await db.Booking.create({
            eventType, eventDate, startTime, endTime, guestCount, totalAmount, notes,
            status: 'Pending',
            customerId: customerId,
            handledByUserId: SELF_SERVE_USER_ID,
            mealPlan: mealPlan || null, 
        });
        res.status(201).send(booking);
    } catch (error) {
        console.error("CUSTOMER BOOKING CREATION FAILED:", error);
        res.status(500).send({ message: "Failed to create your booking due to a server error." });
    }
};

exports.createByAdmin = async (req, res) => {
    const handledByUserId = req.userId; // Sourced from staff/admin auth token
    const { customerId, eventType, eventDate, startTime, endTime, guestCount, totalAmount, notes, mealPlan } = req.body;
    
    if (!customerId) {
        return res.status(400).send({ message: "A customer must be selected to create a booking." });
    }

    try {
        const booking = await db.Booking.create({
            eventType, eventDate, startTime, endTime, guestCount, totalAmount, notes,
            status: 'Pending',
            customerId: customerId,
            handledByUserId: handledByUserId,
            mealPlan: mealPlan || null,
        });
        res.status(201).send(booking);
    } catch (error) {
        console.error("ADMIN BOOKING CREATION FAILED:", error);
        res.status(500).send({ message: "Failed to create booking. A server error occurred." });
    }
};


exports.update = async (req, res) => {
    const id = req.params.id;
    try {
        const [num] = await db.Booking.update(req.body, {
            where: { id: id }
        });

        if (num == 1) {
            res.send({ message: "Booking was updated successfully." });
        } else {
            res.status(404).send({ message: `Cannot update booking with id=${id}. It may not exist or data was unchanged.` });
        }
    } catch (err) {
        console.error(`ADMIN BOOKING UPDATE FAILED for id ${id}:`, err);
        res.status(500).send({ message: "Error updating the booking." });
    }
};


exports.findAll = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
                { model: User, as: 'handler', attributes: ['id', 'name'] },
                { model: Payment, as: 'payments', required: false }
            ],
            order: [['eventDate', 'DESC']]
        });
        
        const results = bookings.map(b => {
            const bookingJson = b.toJSON();
            const totalPaid = bookingJson.payments ? bookingJson.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0) : 0;
            return { ...bookingJson, paidAmount: totalPaid, balance: parseFloat(bookingJson.totalAmount) - totalPaid, };
        });
        res.send(results);
    } catch (error) {
        console.error("FIND ALL BOOKINGS ERROR:", error); 
        res.status(500).send({ message: "Failed to retrieve bookings." });
    }
};

exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const booking = await Booking.findByPk(id, {
            include: [ { model: Customer, as: 'customer' }, { model: User, as: 'handler' }, { model: Payment, as: 'payments' }]
        });
        if (!booking) {
            return res.status(404).send({message: `Booking with id ${id} not found.`});
        }
        
        // Security check for customers
        if (req.userRole === 'Customer' && req.userId !== booking.customerId) {
            return res.status(403).send({ message: "Forbidden: You do not have permission." });
        }
        
        res.send(booking);
    } catch (err) {
        res.status(500).send({ message: `Error retrieving booking details for id ${id}.` });
    }
};


exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const num = await Booking.destroy({ where: { id: id } });
        if (num == 1) {
            res.send({ message: "Booking was deleted successfully." });
        } else {
            res.status(404).send({ message: `Cannot delete booking with id=${id}.` });
        }
    } catch (err) {
        res.status(500).send({ message: `Could not delete booking with id=${id}.` });
    }
};


exports.checkAvailability = async (req, res) => {
    const { eventDate, startTime, endTime } = req.query;
    if (!eventDate || !startTime || !endTime) {
        return res.status(400).send({ message: "Date and time parameters are required." });
    }
    try {
        const conflictingBooking = await Booking.findOne({
            where: { eventDate, status: { [Op.notIn]: ['Cancelled'] }, [Op.or]: [{ startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }]}
        });
        if (conflictingBooking) {
            return res.status(200).send({ available: false, message: `This time slot is already booked.` });
        }
        res.status(200).send({ available: true, message: "Time slot is available." });
    } catch (error) {
        res.status(500).send({ message: "Error checking availability." });
    }
};


exports.updateByCustomer = async (req, res) => {
    const bookingId = req.params.id;
    const customerId = req.userId;

    try {
        const booking = await db.Booking.findByPk(bookingId);
        if (!booking) return res.status(404).send({ message: "Booking not found." });
        if (booking.customerId !== customerId) return res.status(403).send({ message: "Forbidden: You cannot edit this booking." });
        if (booking.status !== 'Pending') return res.status(400).send({ message: `A booking with '${booking.status}' status cannot be edited.` });
        await booking.update(req.body);
        res.send({ message: "Your booking request was updated successfully." });
    } catch (error) {
        console.error("CUSTOMER BOOKING UPDATE FAILED:", error);
        res.status(500).send({ message: "Error updating your booking." });
    }
};

exports.deleteByCustomer = async (req, res) => {
    const bookingId = req.params.id;
    const customerId = req.userId;

    try {
        const booking = await db.Booking.findByPk(bookingId);
        if (!booking) return res.status(404).send({ message: "Booking not found." });

        // Security checks
        if (booking.customerId !== customerId) return res.status(403).send({ message: "Forbidden: You are not authorized to cancel this booking." });
        if (booking.status !== 'Pending') return res.status(400).send({ message: `Cannot cancel a confirmed or completed booking.` });
        
        // Soft delete by changing status
        await booking.update({ status: 'Cancelled' });
        res.send({ message: "Your booking request has been cancelled." });
        
    } catch (error) {
        console.error("CUSTOMER BOOKING CANCELLATION FAILED:", error);
        res.status(500).send({ message: "Error cancelling your booking request." });
    }
};
exports.findAllForStaff = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
                { model: User, as: 'handler', attributes: ['id', 'name'] },
                { model: Payment, as: 'payments', required: false }
            ],
            order: [['eventDate', 'DESC']]
        });
        
        const results = bookings.map(b => {
            const bookingJson = b.toJSON();
            const totalPaid = bookingJson.payments ? bookingJson.payments.reduce((acc, p) => acc + parseFloat(p.amount), 0) : 0;
            return { ...bookingJson, paidAmount: totalPaid, balance: parseFloat(bookingJson.totalAmount) - totalPaid };
        });
        res.send(results);
    } catch (error) {
        console.error("STAFF 'FIND ALL BOOKINGS' ERROR:", error); 
        res.status(500).send({ message: "Failed to retrieve bookings." });
    }
};