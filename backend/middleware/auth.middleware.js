const jwt = require('jsonwebtoken');
const db = require('../models');

// Verifies a token for STAFF or ADMINS.
const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(403).send({ message: 'No token provided! Access denied.' });
  }
  token = token.slice(7, token.length); 

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized! Token is invalid.' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

//Checks if the logged-in user has the 'Admin' role.Must be used AFTER verifyToken.

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'Admin') {
      return res.status(403).send({ message: "Forbidden: Requires Admin Role!" });
    }
    next();
};


//Verifies a token specifically for CUSTOMERS. It checks the 'Customers' table in the database to ensure the user exists.
const verifyCustomerToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  token = token.slice(7, token.length);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized! Token is invalid.' });
    }
    
    // Security check: ensure the token is actually for a customer role.
    if (decoded.role !== 'Customer') {
      return res.status(403).send({ message: "Access Denied. A customer account is required." });
    }

    try {
      // Security check: verify that this customer ID actually exists in the Customers table.
      const customer = await db.Customer.findByPk(decoded.id);
      if (!customer) {
        return res.status(401).send({ message: 'Unauthorized! Customer not found.' });
      }

      // If valid, attach info to the request and proceed.
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();

    } catch (dbError) {
        console.error("Database error in verifyCustomerToken:", dbError);
        return res.status(500).send({ message: "Server error during authentication." });
    }
  });
};

const authMiddleware = {
  verifyToken,
  isAdmin,
  verifyCustomerToken,
};

module.exports = authMiddleware;