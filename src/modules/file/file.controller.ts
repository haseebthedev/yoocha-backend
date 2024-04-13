import {
  Controller,
  Delete,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.fileService.uploadFile(file);
  }

  @Delete('delete')
  async deleteFile(@Query('publicId') publicId: string) {
    return await this.fileService.deleteFile(publicId);
  }
}
