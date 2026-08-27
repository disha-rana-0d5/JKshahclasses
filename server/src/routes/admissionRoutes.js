const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const { protect, admin } = require('../middleware/authMiddleware');

// Helper function to handle ERP Mappings
const getERPMappings = (data) => {
    // Default mappings based on user's example
    return {
        country: 77, // India
        state: 2, // Default
        city: 31, // Default
        college: 1,
        levelRef: 201,
        course: 150,
        branch: "JKSHAH0001"
    };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};

// Helper function to sync admission with ERP
const syncAdmissionToERP = async (admission) => {
    const ERP_BASE_URL = 'https://edu.jkshahcloud.com:5004';
    const ERP_HEADERS = {
        'Content-Type': 'application/json',
        'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
    };

    if (admission.stuEnqSno) {
        try {
            const mappings = getERPMappings(admission);

            // --- API 1: Personal Details ---
            const personalPayload = {
                personalDetails: {
                    firstName: admission.firstName || "",
                    lastName: admission.lastName || "",
                    address: admission.flatBuildingName || "",
                    streetArea: admission.streetArea || "",
                    country: mappings.country,
                    state: mappings.state,
                    city: mappings.city,
                    pinCode: admission.pinCode || "",
                    mobile: admission.mobileNumber || "",
                    whatsApp: admission.whatsapp || "",
                    email: admission.email || "",
                    dateOfBirth: admission.dob || "",
                    gender: admission.gender?.toLowerCase() || "",
                    college: mappings.college,
                    stuEnqSno: parseInt(admission.stuEnqSno)
                }
            };

            const res1 = await fetchWithTimeout(`${ERP_BASE_URL}/authentication/api/personalDetSave`, {
                method: 'POST',
                headers: ERP_HEADERS,
                body: JSON.stringify(personalPayload)
            });
            const text1 = await res1.text();
            let data1;
            try {
                data1 = JSON.parse(text1);
            } catch (e) {
                throw new Error(`personalDetSave returned HTML instead of JSON. Status: ${res1.status}. Response: ${text1.substring(0, 100)}...`);
            }
            
            if (!data1.success) throw new Error(data1.message || "Failed at personalDetSave");
            const basicDetSno = data1.data?.basicDetails?.data?.sno;
            if (!basicDetSno) throw new Error("No basicDetSno returned from ERP");

            admission.erpSno = basicDetSno; // Store the ERP Sno

            // --- API 2 & 3: Family Details & Course Details (Can run in parallel) ---
            const familyPayload = {
                familydetails: {
                    fatherName: admission.fatherName || "",
                    fatherMobile: admission.fatherMobile || "",
                    fatherOccupation: admission.fatherOccupation || "",
                    fatherDetails: "",
                    motherName: admission.motherName || "",
                    motherMobile: admission.motherMobile || "",
                    motherOccupation: admission.motherOccupation || "",
                    motherDetails: "",
                    caMember: admission.familyCa || "",
                    stuEnqSno: parseInt(admission.stuEnqSno)
                },
                basicDetSno: basicDetSno
            };

            const coursePayload = {
                coursedetails: {
                    course: mappings.course,
                    levelRef: mappings.levelRef,
                    branch: mappings.branch,
                    availBatch: 300, // Hardcoded in example
                    stuEnqSno: parseInt(admission.stuEnqSno),
                    termsAccepted: admission.agreeTerms || false
                },
                basicDetSno: basicDetSno
            };

            const [res2, res3] = await Promise.all([
                fetchWithTimeout(`${ERP_BASE_URL}/authentication/api/familyDetSave`, {
                    method: 'POST',
                    headers: ERP_HEADERS,
                    body: JSON.stringify(familyPayload)
                }),
                fetchWithTimeout(`${ERP_BASE_URL}/authentication/api/courseDetailsSave`, {
                    method: 'POST',
                    headers: ERP_HEADERS,
                    body: JSON.stringify(coursePayload)
                })
            ]);

            const text2 = await res2.text();
            let data2;
            try {
                data2 = JSON.parse(text2);
            } catch (e) {
                throw new Error(`familyDetSave returned HTML instead of JSON. Status: ${res2.status}. Response: ${text2.substring(0, 100)}...`);
            }
            if (!data2.success) throw new Error(data2.message || "Failed at familyDetSave");

            const text3 = await res3.text();
            let data3;
            try {
                data3 = JSON.parse(text3);
            } catch (e) {
                throw new Error(`courseDetailsSave returned HTML instead of JSON. Status: ${res3.status}. Response: ${text3.substring(0, 100)}...`);
            }
            if (!data3.success) throw new Error(data3.message || "Failed at courseDetailsSave");

            // If all 3 pass, mark as synced
            admission.erpSynced = true;
            admission.erpError = "";
            await admission.save();
            return { success: true };
        } catch (erpError) {
            console.error('ERP Sync Error:', erpError);
            admission.erpSynced = false;
            admission.erpError = erpError.message || "Unknown ERP Error";
            await admission.save();
            return { success: false, error: admission.erpError };
        }
    } else {
        // No stuEnqSno available
        admission.erpSynced = false;
        admission.erpError = "No stuEnqSno provided from frontend";
        await admission.save();
        return { success: false, error: admission.erpError };
    }
};

// @route   POST /api/admissions
// @desc    Submit an admission/enquiry form
// @access  Public (or semi-public depending on if they are logged in)
router.post('/', async (req, res) => {
    try {
        const admissionData = req.body;
        const admission = new Admission(admissionData);
        
        // 1. Save locally first (even if ERP fails, we have the record)
        await admission.save();

        // 2. Perform ERP Integration (if stuEnqSno is present)
        await syncAdmissionToERP(admission);

        res.status(201).json({ success: true, data: admission });
    } catch (error) {
        console.error('Error saving admission:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @route   POST /api/admissions/:id/sync-erp
// @desc    Retry syncing an admission to ERP
// @access  Private/Admin
router.post('/:id/sync-erp', protect, admin, async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            return res.status(404).json({ success: false, message: 'Admission not found' });
        }

        const result = await syncAdmissionToERP(admission);
        if (result.success) {
            return res.status(200).json({ success: true, message: 'Successfully synced with ERP', data: admission });
        } else {
            return res.status(400).json({ success: false, message: 'Failed to sync with ERP', error: result.error });
        }
    } catch (error) {
        console.error('Error syncing admission to ERP:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// @route   GET /api/admissions
// @desc    Get all admissions
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const admissions = await Admission.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: admissions.length, data: admissions });
    } catch (error) {
        console.error('Error fetching admissions:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Proxy endpoint to trigger ERP Mobile OTP
router.post('/send-erp-otp', async (req, res) => {
    try {
        const { mobile, email } = req.body;
        if (!mobile || !email) {
            return res.status(400).json({ success: false, message: "mobile and email are required" });
        }

        const ERP_BASE_URL = 'https://edu.jkshahcloud.com:5004';
        const ERP_HEADERS = {
            'Content-Type': 'application/json',
            'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
        };

        const axios = require('axios');
        const response = await axios({
            method: 'GET',
            url: `${ERP_BASE_URL}/authentication/api/sendOtp`,
            headers: ERP_HEADERS,
            data: { mobile, email }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error sending ERP OTP:', error?.response?.data || error);
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ success: false, message: 'Server Error proxying OTP', error: error.message });
    }
});

module.exports = router;
