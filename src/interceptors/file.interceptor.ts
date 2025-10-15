import * as fs from 'fs';
import * as path from 'path';
import * as multer from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

interface FileUploadOptions {
  fieldName?: string;
  destination?: string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

const createFileUploadInterceptor = (options: FileUploadOptions = {}) => {
  const {
    fieldName = 'file',
    destination = 'uploads/',
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedMimeTypes = ['image/'],
  } = options;

  const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  return FileInterceptor(fieldName, {
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        ensureDir(destination);
        cb(null, destination);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    }),
    fileFilter: (_req, file, cb) => {
      const isValidType = allowedMimeTypes.some((mimeType) => file.mimetype.startsWith(mimeType));

      if (isValidType) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${allowedMimeTypes.join(', ')} files are allowed`), false);
      }
    },
    limits: {
      fileSize: maxFileSize,
    },
  });
};

export const ImageInterceptor = createFileUploadInterceptor({
  fieldName: 'file',
  destination: 'uploads/',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/'],
});

export const DocumentInterceptor = createFileUploadInterceptor({
  fieldName: 'document',
  destination: 'uploads/documents/',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
});

export const MultiImageInterceptor = FilesInterceptor('files', 10, {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = 'uploads/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  fileFilter: (_req, file, cb) => {
    const isValidType = file.mimetype.startsWith('image/');

    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const createCustomFileUploadInterceptor = createFileUploadInterceptor;
