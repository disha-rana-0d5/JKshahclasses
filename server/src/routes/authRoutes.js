const express = require('express');
const router = express.Router();
const { loginUser, registerUser, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
