require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./models');

const app = express();

//Middleware 
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Party Palace OMS API' });
});

//API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/dashboard', require('./routes/report.routes'));


//Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

//Database Sync & Server Start 
const PORT = process.env.PORT || 5000;

db.sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});