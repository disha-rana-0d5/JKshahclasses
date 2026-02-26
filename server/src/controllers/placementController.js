const path = require('path');
const { Parser } = require('json2csv');
const Placement = require('../models/Placement');
const Application = require('../models/Application');
const sendEmail = require('../utils/sendEmail');
const paginate = require('../utils/paginate');

// @desc    Submit a job placement (Public)
// @route   POST /api/placements
// @access  Public
exports.createPlacement = async (req, res) => {
    try {
        const placement = await Placement.create(req.body);

        res.status(201).json({
            success: true,
            data: placement
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get active, verified placements
// @route   GET /api/placements/active
// @access  Public
exports.getActivePlacements = async (req, res) => {
    try {
        const options = {
            baseQuery: {
                status: 'Verified',
                expiresAt: { $gt: new Date() }
            },
            searchFields: ['firmName', 'location', 'domainKnowledge'],
            sort: '-dateOfNotice'
        };

        const result = await paginate(Placement, req.query, options);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Apply for a placement
// @route   POST /api/placements/:id/apply
// @access  Public
exports.applyForPlacement = async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({
                success: false,
                message: 'Placement not found'
            });
        }

        // Create application record
        const application = await Application.create({
            placementId: req.params.id,
            ...req.body
        });

        // Resolve local path for attachment (uploads are in server/src/uploads)
        // req.body.resumeUrl is usually /api/upload/file/... or /uploads/...
        // Based on structure check, files are in server/src/uploads
        const filename = path.basename(req.body.resumeUrl);
        const localResumePath = path.join(__dirname, '..', 'uploads', filename);

        // HTML Email Template (Premium Design - No Links)
        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { 
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #1a202c; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f4f7fa;
                }
                .wrapper {
                    width: 100%;
                    table-layout: fixed;
                    background-color: #f4f7fa;
                    padding-bottom: 40px;
                }
                .container { 
                    max-width: 600px; 
                    margin: 40px auto; 
                    background-color: #ffffff;
                    border-radius: 12px; 
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                .header { 
                    background: linear-gradient(135deg, #0056b3 0%, #003d80 100%);
                    padding: 40px 20px; 
                    text-align: center; 
                    color: #ffffff;
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 24px; 
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }
                .header p {
                    margin: 10px 0 0;
                    opacity: 0.9;
                    font-size: 15px;
                }
                .content { 
                    padding: 40px 30px; 
                }
                .introduction {
                    font-size: 18px;
                    color: #2d3748;
                    margin-bottom: 30px;
                }
                .card {
                    background-color: #f8fafc;
                    border-radius: 8px;
                    padding: 25px;
                    margin-bottom: 30px;
                    border: 1px solid #e2e8f0;
                }
                .card-title {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #718096;
                    margin-bottom: 15px;
                    letter-spacing: 1px;
                }
                .details-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                }
                .details-table td { 
                    padding: 12px 0; 
                    border-bottom: 1px solid #edf2f7; 
                }
                .details-table tr:last-child td {
                    border-bottom: none;
                }
                .label { 
                    font-weight: 600; 
                    color: #4a5568; 
                    width: 120px; 
                    font-size: 14px;
                }
                .value {
                    color: #1a202c;
                    font-size: 15px;
                }
                .attachment-note {
                    text-align: center;
                    margin-top: 20px;
                    padding: 15px;
                    background-color: #ebf8ff;
                    border: 1px solid #bee3f8;
                    border-radius: 8px;
                    color: #2b6cb0;
                    font-weight: 600;
                }
                .footer { 
                    padding: 30px; 
                    text-align: center; 
                    font-size: 13px; 
                    color: #a0aec0; 
                    background-color: #ffffff;
                    border-top: 1px solid #edf2f7;
                }
                .highlight { color: #0056b3; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>New Job Application</h1>
                        <p>JK Shah Classes Placement Portal</p>
                    </div>
                    <div class="content">
                        <div class="introduction">
                            Hello, you have received a new candidate application for the position at <span class="highlight">${placement.firmName}</span>.
                        </div>
                        
                        <div class="card">
                            <div class="card-title">Candidate Profile</div>
                            <table class="details-table">
                                <tr>
                                    <td class="label">Name</td>
                                    <td class="value">${req.body.studentName}</td>
                                </tr>
                                <tr>
                                    <td class="label">Email</td>
                                    <td class="value">${req.body.studentEmail}</td>
                                </tr>
                                <tr>
                                    <td class="label">Phone</td>
                                    <td class="value">${req.body.studentPhone}</td>
                                </tr>
                                <tr>
                                    <td class="label">Qualification</td>
                                    <td class="value">${req.body.qualification}</td>
                                </tr>
                            </table>
                        </div>

                        <div class="attachment-note">
                            Please find the candidate's resume attached to this email.
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from the JK Shah Classes Placement Portal.</p>
                        <p>&copy; ${new Date().getFullYear()} JK Shah Classes. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send email to recruiter
        const emailOptions = {
            email: placement.contactEmail,
            subject: `New Application: ${req.body.studentName} for ${placement.firmName}`,
            message: `New application received for ${placement.firmName}. Candidate: ${req.body.studentName}. Please find the resume attached.`,
            html: htmlTemplate,
            attachments: [
                {
                    filename: `${req.body.studentName.replace(/\s+/g, '_')}_Resume.pdf`,
                    path: localResumePath
                }
            ]
        };

        try {
            await sendEmail(emailOptions);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all placements (Admin)
// @route   GET /api/placements/admin
// @access  Private (Admin)
exports.getAdminPlacements = async (req, res) => {
    try {
        const result = await paginate(Placement, req.query, {
            sort: '-createdAt'
        });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update placement status (Verify/Reject)
// @route   PATCH /api/placements/:id/status
// @access  Private (Admin)
exports.updatePlacementStatus = async (req, res) => {
    try {
        let placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({
                success: false,
                message: 'Placement not found'
            });
        }

        placement = await Placement.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: placement
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
// @desc    Get all job applications (Admin)
// @route   GET /api/placements/applications
// @access  Private (Admin)
exports.getApplications = async (req, res) => {
    try {
        const result = await paginate(Application, req.query, {
            sort: '-createdAt',
            populate: {
                path: 'placementId',
                select: 'firmName domainKnowledge location'
            }
        });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Export applications to CSV
// @route   GET /api/placements/applications/export
// @access  Private (Admin)
exports.exportApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate({
                path: 'placementId',
                select: 'firmName domainKnowledge location'
            })
            .sort('-createdAt');

        const fields = [
            { label: 'Applied Date', value: (row) => new Date(row.createdAt).toLocaleString() },
            { label: 'Student Name', value: 'studentName' },
            { label: 'Student Email', value: 'studentEmail' },
            { label: 'Student Phone', value: 'studentPhone' },
            { label: 'Firm Name', value: (row) => row.placementId ? row.placementId.firmName : 'N/A' },
            { label: 'Job Knowledge', value: (row) => row.placementId ? row.placementId.domainKnowledge : 'N/A' },
            { label: 'Location', value: (row) => row.placementId ? row.placementId.location : 'N/A' },
            { label: 'Qualification', value: 'qualification' },
            {
                label: 'Resume URL', value: (row) => {
                    if (!row.resumeUrl) return '';
                    if (row.resumeUrl.startsWith('http')) return row.resumeUrl;
                    const baseUrl = process.env.FRONTEND_URL || '';
                    return `${baseUrl}${row.resumeUrl}`;
                }
            }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(applications);

        res.header('Content-Type', 'text/csv');
        res.attachment(`Job_Applications_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete a placement
// @route   DELETE /api/placements/:id
// @access  Private (Admin)
exports.deletePlacement = async (req, res) => {
    try {
        const placement = await Placement.findById(req.params.id);

        if (!placement) {
            return res.status(404).json({
                success: false,
                message: 'Placement not found'
            });
        }

        // Delete associated applications
        await Application.deleteMany({ placementId: req.params.id });

        // Delete the placement
        await placement.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Placement and associated applications deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
