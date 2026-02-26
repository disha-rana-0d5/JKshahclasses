const express = require('express');
const { sendOtp, verifyOtp, createEnquiry, getEnquiries, updateEnquiryReadStatus, deleteEnquiry } = require('../controllers/branchEnquiryController');

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

router.route('/')
    .post(createEnquiry)
    .get(getEnquiries);

router.route('/:id')
    .delete(deleteEnquiry);

router.patch('/:id/read', updateEnquiryReadStatus);

module.exports = router;
