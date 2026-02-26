const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');

// Helper to get current month-year folder name (e.g., "2026/02")
const getMonthYearFolder = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}/${month}`;
};

// Set Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderName = getMonthYearFolder();
        const uploadPath = path.join(__dirname, `../uploads/${folderName}`);

        // Create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const folderName = getMonthYearFolder();
        const uploadPath = path.join(__dirname, `../uploads/${folderName}`);

        let originalName = file.originalname;
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);

        let finalName = originalName;
        let counter = 1;

        // Check for collisions and append counter if needed
        while (fs.existsSync(path.join(uploadPath, finalName))) {
            finalName = `${name}(${counter})${ext}`;
            counter++;
        }

        cb(null, finalName);
    }
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|webp/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image');


// Check Doc Type
function checkDocType(file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: PDFs Only!');
    }
}

// Init Doc Upload
const uploadDoc = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkDocType(file, cb);
    }
}).single('file');

exports.uploadImage = (req, res) => {
    console.log('Upload Image request received');
    upload(req, res, async (err) => {
        if (err) {
            console.error('Multer error (image):', err);
            res.status(400).json({ message: err });
        } else {
            if (req.file == undefined) {
                console.error('No file in request (image)');
                res.status(400).json({ message: 'Error: No File Selected!' });
            } else {
                console.log('File uploaded successfully (image):', req.file.filename);
                // Return path including the month-year folder
                const folderName = getMonthYearFolder();
                const fileUrl = `/uploads/${folderName}/${req.file.filename}`;

                try {
                    // Save to database
                    const newMedia = new Media({
                        name: req.file.filename,
                        url: fileUrl,
                        type: 'image'
                    });
                    await newMedia.save();

                    res.json({
                        message: 'File Uploaded!',
                        url: fileUrl,
                        media: newMedia
                    });
                } catch (dbErr) {
                    console.error('Database save error:', dbErr);
                    // Still return success for the upload, but log the DB error
                    res.json({
                        message: 'File Uploaded (DB Save Failed)!',
                        url: fileUrl
                    });
                }
            }
        }
    });
};

exports.uploadFile = (req, res) => {
    console.log('Upload File request received');
    uploadDoc(req, res, async (err) => {
        if (err) {
            console.error('Multer error (file):', err);
            res.status(400).json({ message: err });
        } else {
            if (req.file == undefined) {
                console.error('No file in request (file)');
                res.status(400).json({ message: 'Error: No File Selected!' });
            } else {
                console.log('File uploaded successfully (file):', req.file.filename);
                const folderName = getMonthYearFolder();
                const fileUrl = `/uploads/${folderName}/${req.file.filename}`;

                try {
                    // Save to database
                    const newMedia = new Media({
                        name: req.file.filename,
                        url: fileUrl,
                        type: 'file'
                    });
                    await newMedia.save();

                    res.json({
                        message: 'File Uploaded!',
                        url: fileUrl,
                        media: newMedia
                    });
                } catch (dbErr) {
                    console.error('Database save error:', dbErr);
                    res.json({
                        message: 'File Uploaded (DB Save Failed)!',
                        url: fileUrl
                    });
                }
            }
        }
    });
};

exports.getAllMedia = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.json(media);
    } catch (err) {
        console.error('Error fetching media:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Construct file path
        // media.url example: /uploads/february2026/image.png
        // We need: /path/to/server/src/../uploads/february2026/image.png
        // which simplifies to: /path/to/server/uploads/february2026/image.png

        // __dirname is .../server/src/controllers
        // We need to go up to src, then up to server, then into uploads
        const relativePath = media.url.startsWith('/') ? media.url.slice(1) : media.url;
        const filePath = path.join(__dirname, '../../', relativePath);

        // Check if file exists and delete it
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn(`File not found on disk: ${filePath}`);
        }

        await media.deleteOne();

        res.json({ message: 'Media deleted' });
    } catch (err) {
        console.error('Error deleting media:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};
