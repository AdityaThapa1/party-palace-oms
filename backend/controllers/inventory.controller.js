const db = require('../models');
const Inventory = db.Inventory;

// Create a new inventory item
exports.create = (req, res) => {
  Inventory.create(req.body)
    .then(data => res.status(201).send(data))
    .catch(err => res.status(500).send({ message: err.message || "Error creating inventory item." }));
};

// Retrieve all inventory items
exports.findAll = (req, res) => {
  Inventory.findAll({ order: [['itemName', 'ASC']] })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message || "Error retrieving inventory." }));
};

// Update an inventory item
exports.update = (req, res) => {
  const id = req.params.id;
  Inventory.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Inventory item updated successfully." });
      else res.status(404).send({ message: `Cannot update item with id=${id}.` });
    })
    .catch(err => res.status(500).send({ message: "Error updating item." }));
};

// Delete an inventory item
exports.delete = (req, res) => {
  const id = req.params.id;
  Inventory.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) res.send({ message: "Item deleted successfully." });
      else res.status(404).send({ message: `Cannot delete item with id=${id}.` });
    })
    .catch(err => res.status(500).send({ message: "Could not delete item." }));
};