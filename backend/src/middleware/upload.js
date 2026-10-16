const multer = require('multer');
const path = require('path');
const fs = require('fs');

const os = require('os');

function getUploadDir() {
  if (process.env.VERCEL) {
    const tmpUploads = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(tmpUploads)) {
      try {
        fs.mkdirSync(tmpUploads, { recursive: true });
      } catch (_) {}
    }
    return tmpUploads;
  }

  const localDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return localDir;
  } catch (err) {
    const tmpUploads = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(tmpUploads)) {
      try {
        fs.mkdirSync(tmpUploads, { recursive: true });
      } catch (_) {}
    }
    return tmpUploads;
  }
}

const uploadDir = getUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed (max 5 MB).'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5 MB per AGENTS.md rule 6
  fileFilter,
});

module.exports = {
  upload,
  uploadPhoto: upload.single('photo'),
  uploadEvidence: upload.single('evidence'),
};
