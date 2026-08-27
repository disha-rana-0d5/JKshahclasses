const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    fatherName: { type: String, required: false },
    email: { type: String, required: false },
    mobileNumber: { type: String, required: false },
    city: { type: String, required: false },
    branch: { type: String, required: false },
    alternateContact: { type: String, required: false },
    course: { type: String, required: false },
    level: { type: String, required: false },
    attempt: { type: String, required: false },
    percentage10_12: { type: String, required: false },
    residentialArea: { type: String, required: false },
    residentialCity: { type: String, required: false },
    earlierCoachingClass: { type: String, required: false },
    earlierCoachingContactNumber: { type: String, required: false },
    sourceOfInfo: { type: String, required: false },
    remark: { type: String, required: false },
    
    // Tab 1: Personal Details
    flatBuildingName: { type: String, required: false },
    streetArea: { type: String, required: false },
    country: { type: String, required: false },
    state: { type: String, required: false },
    pinCode: { type: String, required: false },
    whatsapp: { type: String, required: false },
    dob: { type: String, required: false },
    gender: { type: String, required: false },
    cptRank: { type: String, required: false },
    
    // Tab 2: Family Details
    fatherMobile: { type: String, required: false },
    fatherOccupation: { type: String, required: false },
    motherName: { type: String, required: false },
    motherMobile: { type: String, required: false },
    motherOccupation: { type: String, required: false },
    familyCa: { type: String, required: false },
    
    // Tab 3: Course Details
    icaiRegistrationNo: { type: String, required: false },
    agreeTerms: { type: Boolean, required: false },
    
    // Tab 4: Payment / Meta
    txnid: { type: String, required: false },
    stat: { type: String, required: false },
    paymentAmount: { type: String, required: false },
    stuEnqSno: { type: String, required: false },
    
    // ERP Integration Tracking
    erpSynced: { type: Boolean, default: false },
    erpError: { type: String, required: false },
    erpSno: { type: Number, required: false },
    
    status: { type: String, default: 'Pending' },
    enquiryId: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
