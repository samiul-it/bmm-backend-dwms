import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SubCategoryService } from './subcategory.service';
import { CreateSubCategoryDto } from './dto/creat.subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update.subcategory.dto';

@Controller('subcategory')
export class SubCategoryController {
  constructor(private categoryService: SubCategoryService) {}

  @Get('/')
  async getAllCategories(@Query('page') page: number) {
    return await this.categoryService.getAllCategories(page);
  }

  @Get('/all')
  async getAllProductCategories() {
    return await this.categoryService.getAllProductCategories();
  }

  @Get('/slug/:slug')
  async getCategorySlug(@Param('slug') slug: string) {
    return await this.categoryService.getCategoryBySlug(slug);
  }

  @Get('/:id')
  async getCategoryById(@Param('id') categoryId: string) {
    return await this.categoryService.getCategoryById(categoryId);
  }

  @Post('/')
  async createCategory(@Body() category: CreateSubCategoryDto) {
    return await this.categoryService.createCategory(category);
  }

  @Put('/:id')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() category: UpdateSubCategoryDto,
  ) {
    return await this.categoryService.updateCategory(categoryId, category);
  }

  @Delete('/:id')
  async deleteCategory(@Param('id') categoryId: string) {
    return await this.categoryService.deleteCategory(categoryId);
  }
}
