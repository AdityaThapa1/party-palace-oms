const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'This email is already registered.' },
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Staff'), defaultValue: 'Staff' },
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  }
  
  return User;
};