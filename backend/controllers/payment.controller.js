const db = require('../models');
const { Payment, Booking } = db;

// Create and Save a new Payment for a booking
exports.create = async (req, res) => {
    const { amount, paymentMethod, notes, bookingId } = req.body;
    if (!amount || !paymentMethod || !bookingId) {
        return res.status(400).send({ message: "Amount, method, and booking ID are required!" });
    }

    try {
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).send({ message: "Booking not found." });
        }
        
        const payment = await Payment.create({ amount, paymentMethod, notes, bookingId });
        res.status(201).send(payment);
    } catch (error) {
        res.status(500).send({ message: error.message || "Error creating the payment." });
    }
};

// Retrieve all Payments for a specific booking
exports.findAllForBooking = (req, res) => {
    const bookingId = req.params.bookingId;
    Payment.findAll({ where: { bookingId: bookingId }, order: [['paymentDate', 'DESC']] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Error retrieving payments for booking." });
        });
};

// Get all payments (can be filtered by date etc.)
exports.findAll = (req, res) => {
    Payment.findAll({ include: [{ model: Booking, include: ['customer']}], order: [['paymentDate', 'DESC']] })
      .then(data => res.send(data))
      .catch(err => res.status(500).send({ message: err.message || "Error retrieving payments." }));
};

// Delete a Payment
exports.delete = (req, res) => {
    const id = req.params.id;
    Payment.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Payment was deleted successfully!" });
            } else {
                res.status(404).send({ message: `Cannot delete Payment with id=${id}. Maybe not found!` });
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Could not delete Payment." });
        });
};