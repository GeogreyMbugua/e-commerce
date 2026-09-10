import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminRequired } from '../../../shared/auth/admin-required.decorator.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';
import {
  AddProductMediaUseCase,
  ChangeProductStatusUseCase,
  CreateProductUseCase,
  DeleteProductMediaUseCase,
  GetAdminProductUseCase,
  ListAdminProductsUseCase,
  ReorderProductMediaUseCase,
  ReplaceProductMediaUseCase,
  UpdateProductMediaUseCase,
  UpdateProductUseCase,
  UploadProductMediaUseCase,
} from '../application/admin-catalog.use-cases.js';
import {
  addMediaByUrlSchema,
  createProductSchema,
  listAdminProductsQuerySchema,
  productIdParamSchema,
  productMediaParamsSchema,
  reorderMediaSchema,
  updateMediaSchema,
  updateProductSchema,
} from './admin-catalog.schemas.js';

@Controller('admin/products')
@AdminRequired()
export class AdminProductsController {
  constructor(
    private readonly listProducts: ListAdminProductsUseCase,
    private readonly getProduct: GetAdminProductUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly changeStatus: ChangeProductStatusUseCase,
    private readonly addMedia: AddProductMediaUseCase,
    private readonly uploadMedia: UploadProductMediaUseCase,
    private readonly replaceMedia: ReplaceProductMediaUseCase,
    private readonly updateMedia: UpdateProductMediaUseCase,
    private readonly deleteMedia: DeleteProductMediaUseCase,
    private readonly reorderMedia: ReorderProductMediaUseCase,
  ) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listAdminProductsQuerySchema))
    query: ReturnType<typeof listAdminProductsQuerySchema.parse>,
  ) {
    return this.listProducts.execute(query);
  }

  @Get(':id')
  detail(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
  ) {
    return this.getProduct.execute(params.id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createProductSchema))
    body: ReturnType<typeof createProductSchema.parse>,
  ) {
    return this.createProduct.execute(body);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
    @Body(new ZodValidationPipe(updateProductSchema))
    body: ReturnType<typeof updateProductSchema.parse>,
  ) {
    return this.updateProduct.execute(params.id, body);
  }

  @Post(':id/publish')
  publish(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
  ) {
    return this.changeStatus.execute(params.id, 'ACTIVE');
  }

  @Post(':id/unpublish')
  unpublish(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
  ) {
    return this.changeStatus.execute(params.id, 'DRAFT');
  }

  @Post(':id/unavailable')
  unavailable(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
  ) {
    return this.changeStatus.execute(params.id, 'UNAVAILABLE');
  }

  @Post(':id/sold')
  sold(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
  ) {
    return this.changeStatus.execute(params.id, 'SOLD');
  }

  @Post(':id/archive')
  archive(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
  ) {
    return this.changeStatus.execute(params.id, 'ARCHIVED');
  }

  @Post(':id/media')
  addMediaByUrl(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
    @Body(new ZodValidationPipe(addMediaByUrlSchema))
    body: ReturnType<typeof addMediaByUrlSchema.parse>,
  ) {
    return this.addMedia.execute(params.id, body);
  }

  @Post(':id/media/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  upload(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('altText') altText?: string,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'A file field named "file" is required.',
      });
    }

    return this.uploadMedia.execute({
      productId: params.id,
      file,
      altText: altText?.trim() || null,
    });
  }

  @Post(':id/media/:mediaId/replace')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  replace(
    @Param(new ZodValidationPipe(productMediaParamsSchema))
    params: ReturnType<typeof productMediaParamsSchema.parse>,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('altText') altText?: string,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'A file field named "file" is required.',
      });
    }

    return this.replaceMedia.execute({
      productId: params.id,
      mediaId: params.mediaId,
      file,
      altText: altText?.trim() || null,
    });
  }

  @Patch(':id/media/:mediaId')
  patchMedia(
    @Param(new ZodValidationPipe(productMediaParamsSchema))
    params: ReturnType<typeof productMediaParamsSchema.parse>,
    @Body(new ZodValidationPipe(updateMediaSchema))
    body: ReturnType<typeof updateMediaSchema.parse>,
  ) {
    return this.updateMedia.execute(params.id, params.mediaId, body);
  }

  @Delete(':id/media/:mediaId')
  removeMedia(
    @Param(new ZodValidationPipe(productMediaParamsSchema))
    params: ReturnType<typeof productMediaParamsSchema.parse>,
  ) {
    return this.deleteMedia.execute(params.id, params.mediaId);
  }

  @Put(':id/media/order')
  reorder(
    @Param(new ZodValidationPipe(productIdParamSchema))
    params: ReturnType<typeof productIdParamSchema.parse>,
    @Body(new ZodValidationPipe(reorderMediaSchema))
    body: ReturnType<typeof reorderMediaSchema.parse>,
  ) {
    return this.reorderMedia.execute(params.id, body.mediaIds);
  }
}
