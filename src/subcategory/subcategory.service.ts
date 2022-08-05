import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubCategory, SubCategoryDocument } from './subcategory.schema';
import { CreateSubCategoryDto } from './dto/creat.subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update.subcategory.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private SubcategoryModel: Model<SubCategoryDocument>,
  ) {}

  async createCategory(category: CreateSubCategoryDto) {
    const exists = await this.SubcategoryModel.findOne({ slug: category.slug });
    if (exists)
      throw new BadRequestException(
        `slug-${category.slug} already exists, slug must be unique`,
      );
    return await new this.SubcategoryModel(category).save().catch((err) => {
      throw new InternalServerErrorException(err, 'Category Creation Faileds');
    });
  }

  async getAllCategories(page: number) {
    const cat = await this.SubcategoryModel.find().catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (page) {
      const results = {};
      const limit = 15;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      if (endIndex < cat.length) {
        results['next'] = Number(page) + 1;
      }
      if (startIndex > 0) {
        results['previous'] = Number(page - 1);
      }
      results['page'] = Number(page);
      results['data'] = cat.slice(startIndex, endIndex);
      return {
        ...results,
      };
    } else {
      return cat;
    }
  }

  async getCategoryById(id: string) {
    const category = await this.SubcategoryModel.findById(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (!category) throw new NotFoundException('Category not Found');
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.SubcategoryModel.findOne({ slug }).catch(
      (err) => {
        throw new InternalServerErrorException(err);
      },
    );
    if (!category) throw new NotFoundException('Category not Found');
    return category;
  }

  async updateCategory(categoryId: string, category: UpdateSubCategoryDto) {
    const exists = await this.SubcategoryModel.findById(categoryId).catch(
      (err) => {
        throw new InternalServerErrorException(err);
      },
    );
    if (!exists) throw new NotFoundException('Category not Found');
    return await this.SubcategoryModel.findByIdAndUpdate(
      categoryId,
      category,
    ).catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  async deleteCategory(id: string) {
    return await this.SubcategoryModel.findByIdAndDelete(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  async getAllProductCategories() {
    return await this.SubcategoryModel.find().catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }
}
