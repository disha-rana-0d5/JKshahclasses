const LandingPageContent = require('../models/LandingPageContent');
const fs = require('fs');
const csv = require('csv-parser');
const { getEmbeddableMapUrl } = require('../utils/urlResolver');

// @desc    Get landing page content
// @route   GET /api/content/landing
// @access  Public
exports.getLandingContent = async (req, res) => {
    try {
        let content = await LandingPageContent.findOne();

        if (content) {
            const contentObj = content.toObject();
            if (contentObj.showAnnouncement === undefined) contentObj.showAnnouncement = true;
            if (!contentObj.announcements || contentObj.announcements.length === 0) {
                contentObj.announcements = [contentObj.announcementText || "Welcome to JK Shah Classes - India's Leading CA Coaching Institute!"];
            }
            if (!contentObj.announcementText) contentObj.announcementText = contentObj.announcements[0];

            // Initialize aboutSection if missing
            if (!contentObj.aboutSection) {
                contentObj.aboutSection = {
                    badge: 'About JK Shah Classes',
                    title: 'Empowering Future Professionals Since 1983',
                    description: 'For over four decades, JK Shah Classes has been at the forefront of CA, CS, and CMA coaching. Our commitment to excellence and student success has made us India\'s most trusted institute.',
                    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                    videoUrl: '',
                    points: [
                        'Pioneers in professional coaching with 40+ years of legacy',
                        'Highest number of All India Rankers annually',
                        'Comprehensive study material tailored for exam success',
                        'Personalized mentorship and doubt-clearing sessions'
                    ]
                };
            }

            res.status(200).json({
                success: true,
                data: contentObj
            });
        } else {
            content = await LandingPageContent.create({});
            res.status(200).json({
                success: true,
                data: content
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update landing page content
// @route   PUT /api/content/landing
// @access  Private/Admin
exports.updateLandingContent = async (req, res) => {
    try {
        console.log("Received update request body:", JSON.stringify(req.body, null, 2));

        // Strip immutable fields from req.body to prevent conflicts
        const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

        // Process branch map URLs if present
        if (updateData.branches && Array.isArray(updateData.branches)) {
            for (let branch of updateData.branches) {
                if (branch.mapUrl) {
                    branch.mapUrl = await getEmbeddableMapUrl(branch.mapUrl);
                }
            }
        }

        console.log("Saving Online Experience Data:", JSON.stringify(updateData.onlineExperience, null, 2));

        const content = await LandingPageContent.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        console.log("Content updated successfully. videoUrl in DB:", content?.onlineExperience?.videoUrl);

        console.log("Content updated successfully. New Header Badge:", content?.branchPage?.header?.badge);

        res.status(200).json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error("Error updating landing content:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error during update',
            error: error.message,
            stack: error.stack
        });
    }
};

// @desc    Export branches to CSV
// @route   GET /api/content/branches/export
// @access  Private/Admin
exports.exportBranches = async (req, res) => {
    console.log("Exporting branches...");
    try {
        const content = await LandingPageContent.findOne();
        if (!content || !content.branches) {
            return res.status(200).send('id,name,city,state,address,pincode,phone,email,timings,students,courses,facilities,faculties,image,mapUrl\n');
        }

        const fields = ['id', 'name', 'city', 'state', 'address', 'pincode', 'phone', 'email', 'timings', 'students', 'courses', 'facilities', 'faculties', 'image', 'mapUrl'];
        const header = fields.join(',') + '\n';
        const rows = content.branches.map(branch => {
            return fields.map(field => {
                let val = branch[field] || '';
                if (Array.isArray(val)) val = val.join(';');
                val = String(val).replace(/"/g, '""');
                if (val.includes(',') || val.includes('\n') || val.includes('"')) val = `"${val}"`;
                return val;
            }).join(',');
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=branches.csv');
        res.status(200).send(header + rows);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Export failed', error: error.message });
    }
};

// @desc    Bulk upload branches from CSV
// @route   POST /api/content/branches/bulk
// @access  Private/Admin
exports.bulkUploadBranches = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
        }

        const branches = [];
        const errors = [];
        let rowCount = 0;

        fs.createReadStream(req.file.path)
            .pipe(csv({
                mapHeaders: ({ header }) => header.toLowerCase().trim()
            }))
            .on('data', (data) => {
                rowCount++;
                if (!data.name || !data.city || !data.address) {
                    errors.push(`Row ${rowCount}: Missing required fields (name, city, address)`);
                    return;
                }

                const branch = {
                    id: parseInt(data.id) || 0,
                    name: (data.name || '').trim(),
                    city: (data.city || '').trim(),
                    state: (data.state || '').trim(),
                    address: (data.address || '').trim(),
                    pincode: (data.pincode || '').trim(),
                    phone: (data.phone || '').trim(),
                    email: (data.email || '').trim(),
                    timings: (data.timings || '').trim(),
                    students: (data.students || '').trim(),
                    courses: (data.courses || '').split(';').map(s => s.trim()).filter(Boolean),
                    facilities: (data.facilities || '').split(';').map(s => s.trim()).filter(Boolean),
                    faculties: (data.faculties || '').split(';').map(s => s.trim()).filter(Boolean),
                    image: (data.image || '').trim(),
                    mapUrl: (data.mapurl || data.mapUrl || '').trim()
                };
                branches.push(branch);
            })
            .on('end', async () => {
                try {
                    const content = await LandingPageContent.findOne();
                    if (!content) throw new Error('Landing page content not found');

                    let existingBranches = content.branches || [];
                    let maxId = existingBranches.reduce((max, b) => Math.max(max, b.id || 0), 0);

                    // Resolve all map URLs in bulk
                    for (let newBranch of branches) {
                        if (newBranch.mapUrl) {
                            newBranch.mapUrl = await getEmbeddableMapUrl(newBranch.mapUrl);
                        }
                    }

                    branches.forEach(newBranch => {
                        let index = -1;
                        if (newBranch.id > 0) {
                            index = existingBranches.findIndex(b => b.id === newBranch.id);
                        }

                        if (index > -1) {
                            // Update
                            existingBranches[index] = { ...existingBranches[index], ...newBranch };
                        } else {
                            // Create
                            if (newBranch.id === 0) {
                                maxId++;
                                newBranch.id = maxId;
                            }
                            existingBranches.push(newBranch);
                        }
                    });

                    content.branches = existingBranches;
                    await content.save();

                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

                    res.status(200).json({
                        success: true,
                        message: `Processed ${branches.length} branches.`,
                        errors: errors.length > 0 ? errors : undefined
                    });
                } catch (err) {
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                    res.status(500).json({ success: false, message: err.message });
                }
            });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete all branches
// @route   DELETE /api/content/branches
// @access  Private/Admin
exports.deleteAllBranches = async (req, res) => {
    try {
        const content = await LandingPageContent.findOne();
        if (!content) {
            return res.status(404).json({ success: false, message: 'Landing page content not found' });
        }

        content.branches = [];
        await content.save();

        res.status(200).json({
            success: true,
            message: 'All branches deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting all branches:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error during deletion',
            error: error.message
        });
    }
};
