const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const paymentEnquiryController = require('../controllers/paymentEnquiryController');

// Public route to create/update enquiry right before payment
router.post('/', paymentEnquiryController.createEnquiry);

// Public route to fetch existing user details by mobile number
router.get('/user/:mobileNumber', paymentEnquiryController.getEnquiryByMobile);

// Proxy route to send OTP
router.post('/send-otp', paymentEnquiryController.sendExternalOtp);

// Public route to fetch enquiry after payment using enqId
router.get('/:enqId', paymentEnquiryController.getEnquiryByEnqId);

// Admin route to fetch all enquiries
router.get('/', protect, admin, paymentEnquiryController.getAllEnquiries);

module.exports = router;
