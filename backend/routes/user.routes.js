const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.use(verifyToken, isAdmin); // All user routes are admin-only

router.post('/', controller.create);
router.get('/', controller.findAll);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;