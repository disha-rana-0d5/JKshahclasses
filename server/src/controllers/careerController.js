const CareerListing = require('../models/CareerListing');
const CareerApplication = require('../models/CareerApplication');
const paginate = require('../utils/paginate');
const { Parser } = require('json2csv');

// @desc    Get all active career listings
// @route   GET /api/careers/active
// @access  Public
exports.getActiveListings = async (req, res) => {
    try {
        const options = {
            baseQuery: { status: 'Active' },
            searchFields: ['title', 'location', 'description'],
            sort: '-createdAt'
        };
        const result = await paginate(CareerListing, req.query, options);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit a career application
// @route   POST /api/careers/apply
// @access  Public
exports.submitApplication = async (req, res) => {
    try {
        const application = await CareerApplication.create(req.body);
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all career listings (Admin)
// @route   GET /api/careers/admin
// @access  Private/Admin
exports.getAdminListings = async (req, res) => {
    try {
        const result = await paginate(CareerListing, req.query, { sort: '-createdAt' });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add or Update career listing
// @route   POST /api/careers/admin
// @access  Private/Admin
exports.addOrUpdateListing = async (req, res) => {
    try {
        const { id } = req.body;
        let listing;
        if (id) {
            listing = await CareerListing.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        } else {
            listing = await CareerListing.create(req.body);
        }
        res.status(200).json({ success: true, data: listing });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete career listing
// @route   DELETE /api/careers/admin/:id
// @access  Private/Admin
exports.deleteListing = async (req, res) => {
    try {
        await CareerListing.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all career applications (Admin)
// @route   GET /api/careers/applications
// @access  Private/Admin
exports.getApplications = async (req, res) => {
    try {
        const result = await paginate(CareerApplication, req.query, {
            sort: '-createdAt',
            populate: { path: 'listingId', select: 'title' }
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Export career applications to CSV
// @route   GET /api/careers/applications/export
// @access  Private/Admin
exports.exportApplications = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }
        const applications = await CareerApplication.find(query).populate('listingId').sort('-createdAt');
        const fields = [
            { label: 'Name', value: 'name' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Category', value: 'category' },
            { label: 'Post Applied', value: 'postApplied' },
            { label: 'Job Listing', value: (row) => row.listingId ? row.listingId.title : 'N/A' },
            { label: 'Resume URL', value: 'resumeUrl' },
            { label: 'Applied Date', value: (row) => new Date(row.createdAt).toLocaleDateString() }
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(applications);
        res.header('Content-Type', 'text/csv');
        res.attachment(`Career_Applications_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Delete career application
// @route   DELETE /api/careers/applications/:id
// @access  Private/Admin
exports.deleteApplication = async (req, res) => {
    try {
        await CareerApplication.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Application deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
