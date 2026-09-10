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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { AdminRequired } from '../../../shared/auth/admin-required.decorator.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';
import {
  AddProductMediaUseCase,
  ChangeProductStatusUseCase,
  CommitProductImportUseCase,
  CreateProductUseCase,
  DeleteProductMediaUseCase,
  GetAdminProductUseCase,
  ListAdminProductsUseCase,
  ParseProductImportUseCase,
  PublishImportedProductsUseCase,
  ReorderProductMediaUseCase,
  ReplaceProductMediaUseCase,
  UpdateProductMediaUseCase,
  UpdateProductUseCase,
  UploadProductMediaUseCase,
} from '../application/admin-catalog.use-cases.js';
import {
  addMediaByUrlSchema,
  createProductSchema,
  importCommitSchema,
  importPreviewRowsSchema,
  importPublishSchema,
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
    private readonly parseImport: ParseProductImportUseCase,
    private readonly commitImport: CommitProductImportUseCase,
    private readonly publishImported: PublishImportedProductsUseCase,
  ) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listAdminProductsQuerySchema))
    query: ReturnType<typeof listAdminProductsQuerySchema.parse>,
  ) {
    return this.listProducts.execute(query);
  }

  @Get('import/template')
  async importTemplate(@Res() res: Response) {
    const csv = await this.parseImport.templateCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="audiovintage-product-import-template.csv"',
    );
    res.send(csv);
  }

  @Post('import/parse')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  parseImportFile(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'A file field named "file" is required (.csv or .xlsx).',
      });
    }

    return this.parseImport.executeFromFile(file);
  }

  @Post('import/preview')
  previewImportRows(
    @Body(new ZodValidationPipe(importPreviewRowsSchema))
    body: ReturnType<typeof importPreviewRowsSchema.parse>,
  ) {
    return this.parseImport.executeFromRows(body.rows);
  }

  @Post('import/commit')
  commitImportRows(
    @Body(new ZodValidationPipe(importCommitSchema))
    body: ReturnType<typeof importCommitSchema.parse>,
  ) {
    return this.commitImport.execute(body.rows);
  }

  @Post('import/publish')
  publishImportedProducts(
    @Body(new ZodValidationPipe(importPublishSchema))
    body: ReturnType<typeof importPublishSchema.parse>,
  ) {
    return this.publishImported.execute(body.productIds);
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
