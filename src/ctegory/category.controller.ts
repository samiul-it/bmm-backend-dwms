import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminUser } from 'src/auth/admin-user.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
@UseGuards(AuthGuard())
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/')
  async getAllCategories(@Query('page') page: number) {
    return await this.categoryService.getAllCategories(page);
  }

  @Get('/all')
  async getAllProductCategories() {
    return await this.categoryService.getAllProductCategories();
  }

  @Get('/getPagination')
  async getPagination(@Query() query: any, @CurrentUser() user: any) {
    // console.log('User ===> ', user);
    // console.log(query);
    
    if (user.role === 'wholeseller') {
      return await this.categoryService.getPaginationWholeseller(
        query,
        user.catagories,
      );
    } else {
      return await this.categoryService.getPagination(query);
    }
  }

  @Get('/lockedCategories')
  async lockedCategories(@Query() query: any, @CurrentUser() user: any) {
    // console.log('User ===> ', user);
    // console.log(query);
    
    if (user.role === 'wholeseller') {
      return await this.categoryService.lockedCategoriesForWholeseller(
        query,
        user.catagories,
      );
    } else {
      return await this.categoryService.getPagination(query);
    }
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
  async createCategory(
    @Body() category: CreateCategoryDto,
    @AdminUser() admin: any,
  ) {
    return await this.categoryService.createCategory(category);
  }
  // @Post('/upload')
  // async createCategoryBulk(@Body() category: CreateCategoryDto[]) {
  //   return await this.categoryService.createCategoryBulk(category);
  // }

  @Put('/:id')
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() category: UpdateCategoryDto,
    @AdminUser() admin: any,
  ) {
    return await this.categoryService.updateCategory(categoryId, category);
  }

  @Post('/deleteOne')
  async deleteCategory(@Body() body: any, @AdminUser() admin: any) {
    return await this.categoryService.deleteCategory(body, admin);
  }

  @Post('/upload')
  async createCategoryBulk(
    @Body() category: CreateCategoryDto[],
    @AdminUser() admin: any,
  ) {
    return await this.categoryService.updateCategoryXlsx(category);
  }
}
