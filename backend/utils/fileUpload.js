const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

const ensureUploadsDir = () => {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
};

const uploadFile = (file, subfolder = 'receipts') => {
    ensureUploadsDir();

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new Error('File type not allowed. Allowed: JPEG, PNG, GIF, WebP, PDF');
    }
    if (file.size > MAX_SIZE) {
        throw new Error('File size exceeds limit (10MB)');
    }

    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueName = `${baseName}_${Date.now()}${ext}`;
    const uploadPath = path.join(UPLOADS_DIR, subfolder);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, uniqueName);
    file.mv(filePath);

    return `uploads/${subfolder}/${uniqueName}`;
};

const deleteFile = (filePath) => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

module.exports = { uploadFile, deleteFile };