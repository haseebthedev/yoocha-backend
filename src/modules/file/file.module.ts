import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [FileController],
  providers: [FileService],
})

export class FileModule {}
