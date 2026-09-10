import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type { Env } from '../config/env.schema.js';

export type UploadedMediaAsset = {
  url: string;
  storageKey: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

@Injectable()
export class CloudinaryMediaStorageService {
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService<Env, true>) {
    const cloudName = this.config.get('CLOUDINARY_CLOUD_NAME', {
      infer: true,
    });
    const apiKey = this.config.get('CLOUDINARY_API_KEY', { infer: true });
    const apiSecret = this.config.get('CLOUDINARY_API_SECRET', {
      infer: true,
    });

    this.configured = Boolean(cloudName && apiKey && apiSecret);

    if (this.configured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  get isConfigured(): boolean {
    return this.configured;
  }

  assertConfigured(): void {
    if (!this.configured) {
      throw new ServiceUnavailableException({
        code: 'CLOUDINARY_NOT_CONFIGURED',
        message:
          'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
    }
  }

  async uploadImage(input: {
    buffer: Buffer;
    mimeType: string;
    folderSuffix: string;
    originalName?: string;
  }): Promise<UploadedMediaAsset> {
    this.assertConfigured();

    const folderRoot =
      this.config.get('CLOUDINARY_FOLDER', { infer: true }) ??
      'audiovintage/products';
    const folder = `${folderRoot}/${input.folderSuffix}`.replace(/\/+/g, '/');

    let result: UploadApiResponse;

    try {
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            overwrite: false,
            unique_filename: true,
            use_filename: Boolean(input.originalName),
            filename_override: input.originalName,
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error ?? new Error('Cloudinary upload returned no result.'));
              return;
            }
            resolve(uploadResult);
          },
        );

        stream.end(input.buffer);
      });
    } catch (error) {
      throw new BadRequestException({
        code: 'CLOUDINARY_UPLOAD_FAILED',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to upload image to Cloudinary.',
      });
    }

    if (!result.secure_url || !result.public_id) {
      throw new BadRequestException({
        code: 'CLOUDINARY_UPLOAD_FAILED',
        message: 'Cloudinary did not return a usable image URL.',
      });
    }

    return {
      url: result.secure_url,
      storageKey: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  async deleteImage(storageKey: string): Promise<void> {
    if (!this.configured || !storageKey.trim()) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(storageKey, {
        resource_type: 'image',
        invalidate: true,
      });
    } catch {
      // Best-effort cleanup — catalogue row removal must still succeed.
    }
  }
}
