const RankHolder = require('../models/RankHolder');
const paginate = require('../utils/paginate');
const fs = require('fs');
const csv = require('csv-parser');

exports.getAllRankHolders = async (req, res) => {
    try {
        let { category, subCategory, course, filter } = req.query;

        let filterObj = {};
        if (filter) {
            try {
                filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;
            } catch (e) {
                console.error('Error parsing filter in controller:', e);
            }
        }

        const targetCategory = category || filterObj.category;
        const targetSubCategory = subCategory || filterObj.subCategory;
        const targetCourse = course || filterObj.course;

        const baseQuery = {};
        if (targetCourse) baseQuery.course = targetCourse;

        if (targetCategory && targetSubCategory) {
            baseQuery.$or = [
                { category: targetCategory, subCategory: targetSubCategory },
                { category: targetSubCategory },
                { subCategory: targetSubCategory }
            ];
        } else if (targetCategory) {
            baseQuery.$or = [
                { category: targetCategory },
                { subCategory: targetCategory }
            ];
        } else if (targetSubCategory) {
            baseQuery.$or = [
                { subCategory: targetSubCategory },
                { category: targetSubCategory }
            ];
        }

        if (filterObj.category) delete filterObj.category;
        if (filterObj.subCategory) delete filterObj.subCategory;
        if (filterObj.course) delete filterObj.course;

        const modifiedQuery = { ...req.query };
        if (filter) {
            modifiedQuery.filter = JSON.stringify(filterObj);
        }

        const options = {
            searchFields: ['name', 'category', 'subCategory', 'course', 'session'],
            sort: '-createdAt',
            baseQuery
        };

        const result = await paginate(RankHolder, modifiedQuery, options);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.addRankHolder = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';
        const rankHolder = await RankHolder.create(req.body);
        res.status(201).json({
            success: true,
            data: rankHolder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateRankHolder = async (req, res) => {
    try {
        if (req.body.hasOwnProperty('image') && !req.body.image) {
            req.body.image = '/uploads/placeholder.png';
        }
        const rankHolder = await RankHolder.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!rankHolder) {
            return res.status(404).json({
                success: false,
                message: 'Rank holder not found'
            });
        }
        res.status(200).json({
            success: true,
            data: rankHolder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteRankHolder = async (req, res) => {
    try {
        const rankHolder = await RankHolder.findByIdAndDelete(req.params.id);
        if (!rankHolder) {
            return res.status(404).json({
                success: false,
                message: 'Rank holder not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Rank holder deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteAllRankHolders = async (req, res) => {
    try {
        await RankHolder.deleteMany({});
        res.status(200).json({
            success: true,
            message: 'All rank holders deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Export rank holders to CSV
// @route   GET /api/rank-holders/export
// @access  Private/Admin
exports.exportRankHolders = async (req, res) => {
    try {
        const rankHolders = await RankHolder.find({}).sort('-createdAt');

        // Define fields to export. vital: _id for updates
        const fields = ['_id', 'name', 'category', 'subCategory', 'globalRank', 'indiaRank', 'course', 'session', 'score', 'image'];

        // Manual CSV conversion
        const header = fields.join(',') + '\n';
        const rows = rankHolders.map(rh => {
            return fields.map(field => {
                let val = rh[field] || '';
                // Escape quotes and wrap in quotes if contains comma
                val = String(val).replace(/"/g, '""');
                if (val.includes(',')) val = `"${val}"`;
                return val;
            }).join(',');
        }).join('\n');

        const csvData = header + rows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=rank-holders.csv');
        res.status(200).send(csvData);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to export rank holders'
        });
    }
};

// @desc    Bulk upload rank holders from CSV (Create or Update)
// @route   POST /api/rank-holders/bulk
// @access  Private/Admin
exports.bulkUploadRankHolders = async (req, res) => {
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
                // Validation (skip if empty row)
                if (Object.keys(data).length === 0) return;

                if (!data.name || !data.category || !data.course || !data.session) {
                    errors.push(`Row ${rowCount}: Missing required fields (name, category, course, session)`);
                } else {
                    const record = {
                        name: data.name.trim(),
                        category: data.category ? data.category.trim() : "",
                        subCategory: data.subcategory ? data.subcategory.trim() : "",
                        globalRank: data.globalrank ? data.globalrank.trim() : "",
                        indiaRank: data.indiarank ? data.indiarank.trim() : "",
                        course: data.course.trim(),
                        session: data.session.trim(),
                        score: data.score ? String(data.score).trim() : "",
                        image: data.image ? data.image.trim() : "/uploads/placeholder.png"
                    };

                    // ID-based Update Logic
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

                    // Process Updates
                    for (const update of updates) {
                        try {
                            const { _id, ...updateData } = update;
                            // Check if ID is valid format
                            if (_id.match(/^[0-9a-fA-F]{24}$/)) {
                                const result = await RankHolder.findByIdAndUpdate(_id, updateData, { new: true });
                                if (result) updatedCount++;
                                else errors.push(`Record not found for ID ${_id}`);
                            } else {
                                errors.push(`Invalid ID format: ${_id}`);
                            }
                        } catch (err) {
                            errors.push(`Failed to update record with ID ${update._id}: ${err.message}`);
                        }
                    }

                    // Process New Records
                    if (newRecords.length > 0) {
                        await RankHolder.insertMany(newRecords);
                        createdCount = newRecords.length;
                    }

                    // Clean up uploaded file
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
