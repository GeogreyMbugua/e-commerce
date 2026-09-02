import { Controller, Get } from '@nestjs/common';
import { ListCategoriesUseCase } from '../application/list-categories.use-case.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly listCategories: ListCategoriesUseCase) {}

  @Get()
  list() {
    return this.listCategories.execute();
  }
}
