const Faculty = require('../models/Faculty');
const paginate = require('../utils/paginate');
const fs = require('fs');
const csv = require('csv-parser');

exports.getFaculties = async (req, res) => {
    try {
        const options = {
            searchFields: ['name', 'designation', 'expertise', 'specialization'],
            sort: '-createdAt'
        };

        const result = await paginate(Faculty, req.query, options);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.addFaculty = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';
        const faculty = new Faculty(req.body);
        const newFaculty = await faculty.save();
        res.status(201).json({
            success: true,
            data: newFaculty
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateFaculty = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';
        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            success: true,
            data: updatedFaculty
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Faculty deleted'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteAllFaculties = async (req, res) => {
    try {
        await Faculty.deleteMany({});
        res.status(200).json({
            success: true,
            message: 'All faculties deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Export faculties to CSV / Download Template
// @route   GET /api/faculties/export
// @access  Private/Admin
exports.exportFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find({}).sort('-createdAt');

        const fields = [
            '_id', 'name', 'designation', 'expertise', 'experience',
            'rating', 'totalStudents', 'coursesTaught', 'image',
            'specialization', 'qualifications', 'tagline', 'achievements'
        ];

        const header = fields.join(',') + '\n';
        const rows = faculties.map(f => {
            return fields.map(field => {
                let val = f[field];

                // Handle array fields
                if (Array.isArray(val)) {
                    val = val.join('; ');
                } else if (val === undefined || val === null) {
                    val = '';
                }

                val = String(val).replace(/"/g, '""');
                if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                    val = `"${val}"`;
                }
                return val;
            }).join(',');
        }).join('\n');

        const csvData = header + rows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=faculties.csv');
        res.status(200).send(csvData);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to export faculties'
        });
    }
};

// @desc    Bulk upload faculties from CSV (Create or Update)
// @route   POST /api/faculties/bulk
// @access  Private/Admin
exports.bulkUploadFaculties = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a CSV file'
            });
        }

        const updates = [];
        const newRecords = [];
        const errors = [];
        let rowCount = 0;

        fs.createReadStream(req.file.path)
            .pipe(csv({
                mapHeaders: ({ header }) => header.toLowerCase().trim()
            }))
            .on('data', (data) => {
                rowCount++;
                if (Object.keys(data).length === 0) return;

                // Validation
                if (!data.name || !data.designation || !data.expertise) {
                    errors.push(`Row ${rowCount}: Missing required fields (name, designation, expertise)`);
                } else {
                    const record = {
                        name: data.name.trim(),
                        designation: data.designation.trim(),
                        expertise: data.expertise.trim(),
                        experience: Number(data.experience) || 0,
                        rating: data.rating ? data.rating.trim() : "5.0",
                        totalStudents: data.totalstudents ? data.totalstudents.trim() : "",
                        image: data.image ? data.image.trim() : "/uploads/placeholder.png",
                        specialization: data.specialization ? data.specialization.trim() : "",
                        tagline: data.tagline ? data.tagline.trim() : "",
                        // Arrays: split by semicolon or comma and trim
                        coursesTaught: data.coursestaught ? data.coursestaught.split(/[;,]/).map(s => s.trim()).filter(Boolean) : [],
                        qualifications: data.qualifications ? data.qualifications.split(/[;,]/).map(s => s.trim()).filter(Boolean) : [],
                        achievements: data.achievements ? data.achievements.split(/[;,]/).map(s => s.trim()).filter(Boolean) : []
                    };

                    if (data._id && data._id.trim() !== '') {
                        updates.push({ _id: data._id.trim(), ...record });
                    } else {
                        newRecords.push(record);
                    }
                }
            })
            .on('end', async () => {
                try {
                    let updatedCount = 0;
                    let createdCount = 0;

                    for (const update of updates) {
                        try {
                            const { _id, ...updateData } = update;
                            if (_id.match(/^[0-9a-fA-F]{24}$/)) {
                                const result = await Faculty.findByIdAndUpdate(_id, updateData, { new: true });
                                if (result) updatedCount++;
                                else errors.push(`Record not found for ID ${_id}`);
                            } else {
                                errors.push(`Invalid ID format: ${_id}`);
                            }
                        } catch (err) {
                            errors.push(`Failed to update record with ID ${update._id}: ${err.message}`);
                        }
                    }

                    if (newRecords.length > 0) {
                        await Faculty.insertMany(newRecords);
                        createdCount = newRecords.length;
                    }

                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

                    res.status(200).json({
                        success: true,
                        count: updatedCount + createdCount,
                        updated: updatedCount,
                        created: createdCount,
                        errors: errors.length > 0 ? errors : undefined,
                        message: `Processed. Updated: ${updatedCount}, Created: ${createdCount}`
                    });
                } catch (err) {
                    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                    res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }
            });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
