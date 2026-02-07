const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// @route   POST /api/upload
// @desc    Upload image to Cloudinary
// @access  Admin only
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Convert buffer to base64 for Cloudinary upload
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'navigator-products',
            resource_type: 'image',
            transformation: [
                { width: 800, height: 1000, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        });

        res.status(200).json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
});

// @route   DELETE /api/upload/:public_id
// @desc    Delete image from Cloudinary
// @access  Admin only
router.delete('/:public_id', protect, admin, async (req, res) => {
    try {
        const { public_id } = req.params;
        await cloudinary.uploader.destroy(`navigator-products/${public_id}`);
        res.status(200).json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete image' });
    }
});

module.exports = router;
