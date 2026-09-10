import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminRequired } from '../../../shared/auth/admin-required.decorator.js';
import { ZodValidationPipe } from '../../../shared/validation/zod-validation.pipe.js';
import {
  CreateCategoryUseCase,
  DeleteCategoryImageUseCase,
  ListAdminCategoriesUseCase,
  SetCategoryActiveUseCase,
  UpdateCategoryUseCase,
  UploadCategoryImageUseCase,
} from '../application/admin-catalog.use-cases.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from './admin-catalog.schemas.js';

@Controller('admin/categories')
@AdminRequired()
export class AdminCategoriesController {
  constructor(
    private readonly listCategories: ListAdminCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly setCategoryActive: SetCategoryActiveUseCase,
    private readonly uploadCategoryImage: UploadCategoryImageUseCase,
    private readonly deleteCategoryImage: DeleteCategoryImageUseCase,
  ) {}

  @Get()
  list() {
    return this.listCategories.execute();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCategorySchema))
    body: ReturnType<typeof createCategorySchema.parse>,
  ) {
    return this.createCategory.execute(body);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: ReturnType<typeof categoryIdParamSchema.parse>,
    @Body(new ZodValidationPipe(updateCategorySchema))
    body: ReturnType<typeof updateCategorySchema.parse>,
  ) {
    return this.updateCategory.execute(params.id, body);
  }

  @Post(':id/activate')
  activate(
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: ReturnType<typeof categoryIdParamSchema.parse>,
  ) {
    return this.setCategoryActive.execute(params.id, true);
  }

  @Post(':id/deactivate')
  deactivate(
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: ReturnType<typeof categoryIdParamSchema.parse>,
  ) {
    return this.setCategoryActive.execute(params.id, false);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  uploadImage(
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: ReturnType<typeof categoryIdParamSchema.parse>,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'A file field named "file" is required.',
      });
    }

    return this.uploadCategoryImage.execute({
      categoryId: params.id,
      file,
    });
  }

  @Delete(':id/image')
  deleteImage(
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: ReturnType<typeof categoryIdParamSchema.parse>,
  ) {
    return this.deleteCategoryImage.execute(params.id);
  }
}
