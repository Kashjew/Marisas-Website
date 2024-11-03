const multer = require('multer');

// Set up multer to handle image uploads directly in memory
const storage = multer.memoryStorage();

// Set up multer with both single and multiple file upload capabilities
const upload = multer({
    storage: storage,
});

// Middleware to handle single image upload with logging
const singleLoggingUpload = (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(500).json({ message: 'Multer error occurred' });
        } else if (err) {
            console.error('Unknown error during file upload:', err);
            return res.status(500).json({ message: 'Unknown error occurred' });
        }

        // Log to check if req.file exists and contents
        if (req.file) {
            console.log('Single file uploaded:', req.file.originalname);
            console.log('File type:', req.file.mimetype);
            console.log('File size:', req.file.size);
            console.log('Buffer length:', req.file.buffer.length);
        } else {
            console.log('No file uploaded');
        }

        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to handle multiple image uploads with logging
const multipleLoggingUpload = (req, res, next) => {
    upload.array('images', 5)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(500).json({ message: 'Multer error occurred' });
        } else if (err) {
            console.error('Unknown error during multiple file upload:', err);
            return res.status(500).json({ message: 'Unknown error occurred' });
        }

        // Log to check if req.files exists and contents
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                console.log('Multiple files uploaded:', file.originalname);
                console.log('File type:', file.mimetype);
                console.log('File size:', file.size);
                console.log('Buffer length:', file.buffer.length);
            });
        } else {
            console.log('No files uploaded');
        }

        next(); // Proceed to the next middleware or route handler
    });
};

// Export both single and multiple upload handlers
module.exports = {
    singleLoggingUpload,      // Single image upload with logging
    multipleLoggingUpload,     // Multiple images upload with logging (max 5)
    upload                    // Export the upload object itself to ensure .array() is available
};
