const LandingPageContent = require('../models/LandingPageContent');

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
