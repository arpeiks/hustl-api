import * as path from 'path';
import * as fs from 'node:fs/promises';
import { generateOtp, go } from '@/utils';
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly client = cloudinary;

  constructor() {}

  async upload(file: Express.Multer.File, folder?: string) {
    const { originalname } = file;
    const fileNameParts = originalname.split('.');
    const fileNameWithNoExt = fileNameParts.slice(0, -1).join('.');
    const key = `${fileNameWithNoExt}-${generateOtp(12)}`.replaceAll(' ', '_');
    const res = await this.client.uploader.upload(file.path, {
      public_id: key,
      folder,
      filename_override: key,
      file,
      resource_type: 'auto',
    });

    for (const file of await fs.readdir('uploads')) {
      go(async () => await fs.unlink(path.join('uploads', file)));
    }

    return res.url || undefined;
  }
}
