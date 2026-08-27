const express = require('express');
const router = express.Router();

// @route   POST /api/payment/easebuzz-callback
// @desc    Handle Easebuzz payment success/failure redirect
// @access  Public
router.post('/easebuzz-callback', (req, res) => {
    // Easebuzz sends payment details in req.body via POST
    const { status, txnid, amount, hash } = req.body;
    
    // Log for debugging
    console.log("Easebuzz Callback Received:", req.body);

    if (status === 'success') {
        // Redirect to the frontend React form
        res.redirect(`/payment-success?status=success&txnid=${txnid}`);
    } else {
        // Redirect to a generic error or home page if payment failed
        res.redirect(`/?payment=failed`);
    }
});

module.exports = router;
