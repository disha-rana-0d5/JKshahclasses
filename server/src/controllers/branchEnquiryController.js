const BranchEnquiry = require('../models/BranchEnquiry');
const sendEmail = require('../utils/sendEmail');

// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = {};

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// @desc    Send OTP to email
// @route   POST /api/branch-enquiries/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const otp = generateOtp();
        otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 min expiry

        await sendEmail({
            email,
            subject: 'Your JK Shah Classes Enquiry OTP',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
                    <h2 style="color:#373081;margin-bottom:8px;">JK Shah Classes</h2>
                    <p style="color:#374151;">Use the OTP below to verify your branch enquiry:</p>
                    <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
                        <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#373081;">${otp}</span>
                    </div>
                    <p style="color:#6b7280;font-size:13px;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
                </div>
            `,
        });

        res.status(200).json({ success: true, message: 'OTP sent to email.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send OTP. ' + error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/branch-enquiries/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
        }

        const record = otpStore[email];
        if (!record) {
            return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
        }
        if (Date.now() > record.expiresAt) {
            delete otpStore[email];
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }
        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        }

        // OTP valid - clean up
        delete otpStore[email];
        res.status(200).json({ success: true, message: 'OTP verified.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new branch enquiry
// @route   POST /api/branch-enquiries
// @access  Public
const createEnquiry = async (req, res) => {
    try {
        const { name, email, phone, course, branchName, description } = req.body;

        if (!name || !email || !phone || !course || !branchName) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        const enquiry = await BranchEnquiry.create({
            name,
            email,
            phone,
            course,
            branchName,
            description
        });

        res.status(201).json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all branch enquiries
// @route   GET /api/branch-enquiries
// @access  Private/Admin
const getEnquiries = async (req, res) => {
    try {
        const enquiries = await BranchEnquiry.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update enquiry read status
// @route   PATCH /api/branch-enquiries/:id/read
// @access  Private/Admin
const updateEnquiryReadStatus = async (req, res) => {
    try {
        const { isRead } = req.body;
        const enquiry = await BranchEnquiry.findByIdAndUpdate(
            req.params.id,
            { isRead },
            { new: true }
        );

        if (!enquiry) {
            return res.status(404).json({ success: false, message: 'Enquiry not found.' });
        }

        res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete an enquiry
// @route   DELETE /api/branch-enquiries/:id
// @access  Private/Admin
const deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await BranchEnquiry.findByIdAndDelete(req.params.id);

        if (!enquiry) {
            return res.status(404).json({ success: false, message: 'Enquiry not found.' });
        }

        res.status(200).json({ success: true, message: 'Enquiry deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    createEnquiry,
    getEnquiries,
    updateEnquiryReadStatus,
    deleteEnquiry,
};
