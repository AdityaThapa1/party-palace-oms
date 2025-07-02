module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    paymentMethod: {
      type: DataTypes.ENUM('Cash', 'Bank Transfer', 'E-Sewa', 'Khalti', 'Cheque'),
      allowNull: false,
    },
    notes: { type: DataTypes.STRING, allowNull: true },
  });
  return Payment;
};