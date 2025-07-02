const db = require('../models');
const jwt = require('jsonwebtoken');
const User = db.User;

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    const passwordIsValid = await user.validPassword(req.body.password);
    if (!passwordIsValid) {
      return res.status(401).send({ accessToken: null, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h', // 24 hours
    });

    res.status(200).send({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};