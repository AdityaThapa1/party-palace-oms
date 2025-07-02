module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY, // Stores date without time, e.g., '2025-12-31'
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME, // Stores time without date, e.g., '10:00:00'
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    guestCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled'),
      defaultValue: 'Pending',
    
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    
    mealPlan: {
      type: DataTypes.JSON,
      allowNull: true, 
    },
    // Foreign Keys will be added automatically by the associations in `models/index.js`

  }, {
    
    timestamps: true, 
    tableName: 'Bookings',
  });

  return Booking;
};