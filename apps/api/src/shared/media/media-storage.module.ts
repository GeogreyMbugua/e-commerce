import { Global, Module } from '@nestjs/common';
import { CloudinaryMediaStorageService } from './cloudinary-media-storage.service.js';

@Global()
@Module({
  providers: [CloudinaryMediaStorageService],
  exports: [CloudinaryMediaStorageService],
})
export class MediaStorageModule {}
