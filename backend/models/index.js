const dbConfig = require('../config/database.js');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: { ...dbConfig.pool },
  logging: false // Set to console.log to see raw SQL queries
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model.js')(sequelize, Sequelize);
db.Customer = require('./customer.model.js')(sequelize, Sequelize);
db.Inventory = require('./inventory.model.js')(sequelize, Sequelize);
db.Booking = require('./booking.model.js')(sequelize, Sequelize);
db.Payment = require('./payment.model.js')(sequelize, Sequelize);

// --- Define Associations ---

// User <> Booking (A user/staff handles many bookings)
db.User.hasMany(db.Booking, { foreignKey: { name: 'handledByUserId', allowNull: false } });
db.Booking.belongsTo(db.User, { as: 'handler', foreignKey: { name: 'handledByUserId', allowNull: false } });

// Customer <> Booking (A customer can have many bookings)
db.Customer.hasMany(db.Booking, { foreignKey: { name: 'customerId', allowNull: false } });
db.Booking.belongsTo(db.Customer, { as: 'customer', foreignKey: { name: 'customerId', allowNull: false } });

// Booking <> Payment (A booking can have multiple payments - e.g., advance, final)
db.Booking.hasMany(db.Payment, { foreignKey: 'bookingId', onDelete: 'CASCADE', as: 'payments' });
db.Payment.belongsTo(db.Booking, { foreignKey: 'bookingId' });

module.exports = db;