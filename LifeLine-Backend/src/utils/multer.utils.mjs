import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(runtimeDir, '../uploads');

// File size limits (bytes)
export const FILE_SIZE_LIMITS = {
  PROFILE_PICTURE: 5 * 1024 * 1024,
  MEDICAL_DOCUMENT: 10 * 1024 * 1024,
  CERTIFICATION: 15 * 1024 * 1024,
  GENERAL: 25 * 1024 * 1024,
};

export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  MEDICAL_DOCUMENTS: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  CERTIFICATIONS: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(uploadsRoot, destination);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      const basename = path.basename(file.originalname, extension);
      const sanitizedBasename = basename.replace(/[^a-zA-Z0-9-_]/g, '_');
      cb(null, `${sanitizedBasename}-${uniqueSuffix}${extension}`);
    },
  });

const createFileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
};

export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const codeToMessage = {
      LIMIT_FILE_SIZE: 'File too large',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    };

    return res.status(400).json({
      success: false,
      message: codeToMessage[error.code] || 'File upload error',
      error: error.code,
    });
  }

  if (typeof error?.message === 'string' && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
};

export const uploadProfilePicture = multer({
  storage: createStorage('profile-pictures'),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.IMAGES),
  limits: { fileSize: FILE_SIZE_LIMITS.PROFILE_PICTURE, files: 1 },
}).single('profileImage');

export const uploadMedicalDocument = multer({
  storage: createStorage('medical-documents'),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.MEDICAL_DOCUMENTS),
  limits: { fileSize: FILE_SIZE_LIMITS.MEDICAL_DOCUMENT, files: 5 },
}).array('medicalDocuments', 5);

export const uploadCertification = multer({
  storage: createStorage('certifications'),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.CERTIFICATIONS),
  limits: { fileSize: FILE_SIZE_LIMITS.CERTIFICATION, files: 3 },
}).array('certifications', 3);

const generalAllowedTypes = [...ALLOWED_FILE_TYPES.IMAGES, ...ALLOWED_FILE_TYPES.DOCUMENTS];

export const uploadGeneralFile = multer({
  storage: createStorage('general'),
  fileFilter: createFileFilter(generalAllowedTypes),
  limits: { fileSize: FILE_SIZE_LIMITS.GENERAL, files: 1 },
}).single('file');

export const uploadMultipleGeneralFiles = multer({
  storage: createStorage('general'),
  fileFilter: createFileFilter(generalAllowedTypes),
  limits: { fileSize: FILE_SIZE_LIMITS.GENERAL, files: 10 },
}).array('files', 10);

export const uploadEmergencyPhoto = multer({
  storage: createStorage('emergency-photos'),
  fileFilter: createFileFilter(ALLOWED_FILE_TYPES.IMAGES),
  limits: { fileSize: FILE_SIZE_LIMITS.PROFILE_PICTURE, files: 5 },
}).array('emergencyPhotos', 5);

export const createCustomUpload = (options = {}) => {
  const {
    destination = 'general',
    allowedTypes = generalAllowedTypes,
    maxSize = FILE_SIZE_LIMITS.GENERAL,
    maxFiles = 1,
    fieldName = 'file',
  } = options;

  const upload = multer({
    storage: createStorage(destination),
    fileFilter: createFileFilter(allowedTypes),
    limits: { fileSize: maxSize, files: maxFiles },
  });

  return maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);
};

export const deleteFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
};

export const cleanupOldFiles = (directory, maxAgeMs = 30 * 24 * 60 * 60 * 1000) => {
  const dirPath = path.join(uploadsRoot, directory);
  if (!fs.existsSync(dirPath)) return;

  const now = Date.now();
  for (const file of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (now - stats.mtime.getTime() > maxAgeMs) {
      deleteFile(filePath);
    }
  }
};

export const generateFileUrl = (
  filePath,
  baseUrl = process.env.BASE_URL || 'http://localhost:5000',
) => {
  const relativePath = path.relative(uploadsRoot, filePath).replace(/\\/g, '/');
  return `${baseUrl}/uploads/${relativePath}`;
};

export default {
  uploadProfilePicture,
  uploadMedicalDocument,
  uploadCertification,
  uploadGeneralFile,
  uploadMultipleGeneralFiles,
  uploadEmergencyPhoto,
  createCustomUpload,
  handleMulterError,
  cleanupOldFiles,
  generateFileUrl,
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
};
