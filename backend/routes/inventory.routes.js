const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventory.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.post('/', controller.create);
router.get('/', controller.findAll);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;