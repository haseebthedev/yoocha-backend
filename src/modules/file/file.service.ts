import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class FileService {
  constructor(private hostService: CloudinaryService) {}

  async uploadFile(file: Express.Multer.File) {
    const { resource_type, format, created_at, bytes, secure_url, original_filename, public_id } =
      await this.hostService.uploadFile(file);
    return { type: `${resource_type}/${format}`, created_at, size: bytes, url: secure_url, filename: original_filename, public_id };
  }

  async deleteFile(publicId: string) {
    return await this.hostService.deleteFile(publicId)
  }
}
