const db = require('../models');
const jwt = require('jsonwebtoken'); // <-- ADDED
const Customer = db.Customer;
const { Op } = require("sequelize");

exports.register = async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).send({ message: "Name, Phone, and Password are required!" });
  }

  try {
    const customer = await Customer.create({ name, phone, email, password });
    const customerData = customer.toJSON();
    delete customerData.password; // Don't send password back
    res.status(201).send(customerData);
  } catch (error) {
    res.status(500).send({ message: error.message || "Error registering customer." });
  }
};

//login
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const customer = await Customer.findOne({ where: { phone: phone } });
    
        if (!customer || !customer.password) {
          return res.status(404).send({ message: 'Account not found or not registered for login.' });
        }
    
        const passwordIsValid = await customer.validPassword(password);
        if (!passwordIsValid) {
          return res.status(401).send({ accessToken: null, message: 'Invalid phone or password.' });
        }
    
        const token = jwt.sign({ id: customer.id, role: 'Customer' }, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });
    
        res.status(200).send({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          role: 'Customer',
          accessToken: token,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
  try {
      const bookings = await db.Booking.findAll({
          where: { customerId: req.userId },
          order: [['eventDate', 'DESC']]
      });
      res.send(bookings);
  } catch(error) {
      res.status(500).send({ message: error.message });
  }
};


// Create and Save a new Customer
exports.create = async (req, res) => {
    const { name, phone, email, address } = req.body;
    if (!name || !phone) {
      return res.status(400).send({ message: "Name and Phone are required fields!" });
    }

    try {
        const customer = await Customer.create({ name, phone, email, address });
        res.status(201).send(customer);
    } catch (error) {
        res.status(500).send({ message: error.message || "Error creating the Customer." });
    }
};

exports.findAll = (req, res) => {
    const { search } = req.query;
    let condition = search ? {
        [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ]
    } : null;

    Customer.findAll({ where: condition, order: [['name', 'ASC']] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Error retrieving customers." });
        });
};

// Update a Customer by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    Customer.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Customer was updated successfully." });
      } else {
        res.status(404).send({ message: `Cannot update Customer with id=${id}. Maybe it was not found!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error updating Customer with id=" + id });
    });
};

// Delete a Customer with the specified id
exports.delete = (req, res) => {
    const id = req.params.id;
    Customer.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Customer was deleted successfully!" });
      } else {
        res.status(404).send({ message: `Cannot delete Customer with id=${id}. Maybe it was not found!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete Customer with id=" + id });
    });
};