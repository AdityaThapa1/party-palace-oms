const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: { msg: 'This phone number is already registered.' },
      validate: {
                isNepaliPhone(value) {
                    if (!/^(98|97)\d{8}$/.test(value)) {
                        throw new Error('Invalid phone number. It must be a 10-digit number starting with 98 or 97.');
                    }
                }
            }
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: true, 
      unique: { msg: 'This email is already registered.' },
      validate: { isEmail: true },
      defaultValue: null
    },
    
    password: { type: DataTypes.STRING, allowNull: true },

     address: {
      type: DataTypes.TEXT, 
      allowNull: true,     
    },
  }, { 
    hooks: {
      beforeCreate: async (customer) => {
        if (customer.password) {
          const salt = await bcrypt.genSalt(10);
          customer.password = await bcrypt.hash(customer.password, salt);
        }
      },
      beforeUpdate: async (customer) => {
        if (customer.changed('password') && customer.password) {
          const salt = await bcrypt.genSalt(10);
          customer.password = await bcrypt.hash(customer.password, salt);
        }
      }
    }
  });

  Customer.prototype.validPassword = async function(password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  }

  return Customer;
};