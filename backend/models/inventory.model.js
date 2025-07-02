module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    itemName: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: { msg: 'An item with this name already exists.' }
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    unit: { type: DataTypes.STRING, allowNull: false }, // e.g., 'pcs', 'kgs', 'liters', 'sets'
    lowStockThreshold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
  });
  return Inventory;
};