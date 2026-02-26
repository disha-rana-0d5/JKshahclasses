const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/userController');

// For now, these are public or should be protected by admin middleware if available
// Assuming there's no complex middleware yet, just simple routes
router.get('/', getUsers);
router.put('/:id', updateUser);

module.exports = router;
