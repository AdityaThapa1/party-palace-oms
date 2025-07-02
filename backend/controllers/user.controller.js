const db = require('../models');
const User = db.User;

// Create and Save a new User
exports.create = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).send({ message: "All fields are required!" });
  }

  try {
    const user = await User.create({ name, email, password, role });
    res.status(201).send({id: user.id, name: user.name, email: user.email, role: user.role});
  } catch (error) {
    res.status(500).send({ message: error.message || "Error creating the User." });
  }
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  User.findAll({ attributes: { exclude: ['password'] }})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Error retrieving users." });
    });
};

// Update a User by the id in the request
exports.update = async (req, res) => {
    const id = req.params.id;
    // Don't allow password to be updated from this endpoint for security.
    const { name, email, role } = req.body;
    try {
        const num = await User.update({ name, email, role }, { where: { id: id } });
        if (num == 1) {
            res.send({ message: "User was updated successfully." });
        } else {
            res.status(404).send({ message: `Cannot update User with id=${id}. Maybe User was not found!` });
        }
    } catch (err) {
        res.status(500).send({ message: "Error updating User with id=" + id });
    }
};


// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    User.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "User was deleted successfully!" });
      } else {
        res.status(404).send({ message: `Cannot delete User with id=${id}. Maybe User was not found!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete User with id=" + id });
    });
};