const PaymentEnquiry = require('../models/PaymentEnquiry');
const axios = require('axios');

exports.createEnquiry = async (req, res) => {
    try {
        const { enqId, firstName, email, mobileNumber, course, level, attempt, batch, amount, acadYear, rollNo, type, admSrc, schdlRef, payType, productinfo, compId, finGrp } = req.body;
        
        if (!enqId) {
            return res.status(400).json({ success: false, message: 'enqId is required' });
        }

        let enquiry = await PaymentEnquiry.findOne({ enqId });
        
        if (enquiry) {
            // Update existing
            enquiry.firstName = firstName || enquiry.firstName;
            enquiry.email = email || enquiry.email;
            enquiry.mobileNumber = mobileNumber || enquiry.mobileNumber;
            enquiry.course = course || enquiry.course;
            enquiry.level = level || enquiry.level;
            enquiry.attempt = attempt || enquiry.attempt;
            enquiry.batch = batch || enquiry.batch;
            enquiry.amount = amount || enquiry.amount;
            enquiry.acadYear = acadYear || enquiry.acadYear;
            enquiry.rollNo = rollNo || enquiry.rollNo;
            enquiry.type = type || enquiry.type;
            enquiry.admSrc = admSrc || enquiry.admSrc;
            enquiry.schdlRef = schdlRef || enquiry.schdlRef;
            enquiry.payType = payType || enquiry.payType;
            enquiry.productinfo = productinfo || enquiry.productinfo;
            enquiry.compId = compId || enquiry.compId;
            enquiry.finGrp = finGrp || enquiry.finGrp;
        } else {
            // Create new
            enquiry = new PaymentEnquiry({
                enqId, firstName, email, mobileNumber, course, level, attempt, batch, amount,
                acadYear, rollNo, type, admSrc, schdlRef, payType, productinfo, compId, finGrp
            });
        }
        
        await enquiry.save();
        res.status(201).json({ success: true, data: enquiry });
    } catch (error) {
        console.error('Error in createEnquiry:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getEnquiryByEnqId = async (req, res) => {
    try {
        const { enqId } = req.params;
        const enquiry = await PaymentEnquiry.findOne({ enqId });
        
        if (!enquiry) {
            return res.status(404).json({ success: false, message: 'Enquiry not found' });
        }
        
        res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        console.error('Error in getEnquiryByEnqId:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getEnquiryByMobile = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        const enquiry = await PaymentEnquiry.findOne({ mobileNumber }).sort({ createdAt: -1 });
        
        if (!enquiry) {
            return res.status(200).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ success: true, data: { firstName: enquiry.firstName, email: enquiry.email, mobileNumber: enquiry.mobileNumber } });
    } catch (error) {
        console.error('Error in getEnquiryByMobile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.sendExternalOtp = async (req, res) => {
    try {
        const { mobile, email } = req.body;
        const response = await axios({
            method: 'GET',
            url: 'https://edu.jkshahcloud.com:5004/authentication/api/sendOtp',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            },
            data: { mobile, email } // Sending body with GET
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error in sendExternalOtp:', error.response?.data || error.message);
        res.status(500).json(error.response?.data || { success: false, message: 'Failed to send OTP' });
    }
};

exports.getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await PaymentEnquiry.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: enquiries.length, data: enquiries });
    } catch (error) {
        console.error('Error in getAllEnquiries:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
