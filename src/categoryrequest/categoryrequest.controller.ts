import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CategoryrequestService } from './categoryrequest.service';
import { CreateCategoryrequestDto } from './dto/create-categoryrequest.dto';
import { UpdateCategoryrequestDto } from './dto/update-categoryrequest.dto';

@Controller('categoryrequest')
export class CategoryrequestController {
  constructor(
    private readonly categoryrequestService: CategoryrequestService,
  ) {}

  @Put('/create')
  async createCategoryRequest(
    @Body()
    requestDto: CreateCategoryrequestDto,
  ) {
    return await this.categoryrequestService.manageRequests(requestDto);
  }

  @Post()
  create(@Body() createCategoryrequestDto: CreateCategoryrequestDto) {
    return this.categoryrequestService.create(createCategoryrequestDto);
  }

  //Getting All Requests
  @Get('/')
  async allCategories() {
    return await this.categoryrequestService.getAllCategories();
  }

  //Getting Request By Wholeseller
  @Get('/wholeseller/:id')
  async getCategoriesByWholeseller(@Param('id') id: string) {
    return await this.categoryrequestService.getCategoriesByWholeseller(id);
  }

  // Delete a Request
  @Delete('/:id')
  async deleteCategoryRequest(@Param('id') id: string) {
    return await this.categoryrequestService.deleteCategoryRequest(id);
  }

  @Get()
  findAll() {
    return this.categoryrequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryrequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryrequestDto: UpdateCategoryrequestDto,
  ) {
    return this.categoryrequestService.update(+id, updateCategoryrequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryrequestService.remove(+id);
  }
}
