import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/products/product.schema';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import * as bcrypt from 'bcrypt';
import { NotificationGateway } from 'src/notification/notification.gateway';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private notificationServer: NotificationGateway,
  ) {}

  async createCategory(category: CreateCategoryDto) {
    const exists = await this.categoryModel.findOne({ slug: category.slug });
    if (exists)
      throw new BadRequestException(
        `slug-${category.slug} already exists, slug must be unique`,
      );
    return await new this.categoryModel(category)
      .save()
      .then(() => {
        this.notificationServer.server.emit('notification', {
          message: 'new Category Added Socket Message 🚀',
          data: category,
        });
      })
      .catch((err) => {
        throw new InternalServerErrorException(
          err,
          'Category Creation Faileds',
        );
      });
  }

  async createCategoryBulk(category: CreateCategoryDto[]) {
    return await this.categoryModel.insertMany(category).catch((err) => {
      throw new InternalServerErrorException(
        err,
        'Bulk Category Creation Failed',
      );
    });
  }

  async getAllCategories(page: number) {
    const cat = await this.categoryModel.find().catch((err) => {
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
    const category = await this.categoryModel.findById(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (!category) throw new NotFoundException('Category not Found');
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug }).catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (!category) throw new NotFoundException('Category not Found');
    return category;
  }

  async updateCategory(categoryId: string, category: UpdateCategoryDto) {
    const exists = await this.categoryModel
      .findById(categoryId)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
    if (!exists) throw new NotFoundException('Category not Found');
    return await this.categoryModel
      .findByIdAndUpdate(categoryId, category)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  async deleteCategory(body: any, admin: any) {
    // const exists = await this.productModel
    //   .find({ category: id })
    //   .catch((err) => {
    //     throw new InternalServerErrorException(err);
    //   });
    // if (exists.length > 0) throw new BadRequestException('Category is in use');

    const { id, password } = body;

    if (await bcrypt.compare(password, admin.password)) {
      const category = await this.categoryModel
        .findByIdAndDelete(id)
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
      if (!category) throw new NotFoundException('Category not Found');

      const deleteAllExistingProducts = await this.productModel.deleteMany({
        category: id,
      });

      return {
        message: 'Category Deleted',
      };
    } else {
      throw new BadRequestException('Password is incorrect');
    }
  }

  async getAllProductCategories() {
    return await this.categoryModel.find().catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  async getPagination(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 15;
    // const category_id: string = query.categoryId;
    const searchQuery = query.search;
    let categories: object[];
    let totalDocuments: any;

    const regx = new RegExp(searchQuery);
    const andfilters = [
      {
        $or: [
          { name: { $regex: regx, $options: 'i' } },
          { description: { $regex: regx, $options: 'i' } },
        ],
      },
    ];
    // if (searchQuery) {
    //   andfilters.push({
    //     // @ts-ignore
    //     $or: [
    //       { name: { $regex: regx, $options: 'i' } },
    //       { description: { $regex: regx, $options: 'i' } },
    //     ],
    //   });
    // }

    categories = await this.categoryModel

      .aggregate([
        {
          $match: {
            $and: andfilters,
          },
        },
      ])
      .skip((page - 1) * limit)
      .limit(limit)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });

    if (!categories) throw new NotFoundException('Products not Found');

    const itemCount = await this.categoryModel.aggregate([
      {
        $match: {
          $and: andfilters,
        },
      },
      { $count: 'totalDocuments' },
    ]);

    totalDocuments = itemCount[0]?.totalDocuments;

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      curruntPage: page,
      limit,
      totalPages,
      totalDocuments,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      itemList: categories,
    };

    return result;
  }

  async getPaginationWholeseller(query: any, userCategories: any[]) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 15;
    // const category_id: string = query.categoryId;
    const searchQuery = query.search;
    let categories: object[];
    let totalDocuments: any;

    let userCategoriesIds: any = await Promise.all(
      userCategories.map((category) => {
        return new mongoose.Types.ObjectId(category.categoryId);
      }),
    );

    const regx = new RegExp(searchQuery);
    const andfilters = [
      {
        $or: [
          { name: { $regex: regx, $options: 'i' } },
          { description: { $regex: regx, $options: 'i' } },
        ],
      },
    ];

    // console.log(userCategoriesIds);

    // @ts-ignore
    andfilters.push({ $expr: { $in: ['$_id', userCategoriesIds] } });
    // andfilters.push({ $expr: { $nin: ['$_id', userCategoriesIds] } });

    // console.log(andfilters);

    // if (searchQuery) {
    //   andfilters.push({
    //     // @ts-ignore
    //     $or: [
    //       { name: { $regex: regx, $options: 'i' } },
    //       { description: { $regex: regx, $options: 'i' } },
    //     ],
    //   });
    // }
    // console.log('userCategoriesIds ====>', userCategoriesIds);

    categories = await this.categoryModel

      .aggregate([
        {
          $match: {
            $and: andfilters,
          },
        },
      ])
      .skip((page - 1) * limit)
      .limit(limit)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });

    if (!categories) throw new NotFoundException('Products not Found');

    const itemCount = await this.categoryModel.aggregate([
      {
        $match: {
          $and: andfilters,
        },
      },
      { $count: 'totalDocuments' },
    ]);

    totalDocuments = itemCount[0]?.totalDocuments;

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      curruntPage: page,
      limit,
      totalPages,
      totalDocuments,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      itemList: categories,
    };

    return result;
  }

  async lockedCategoriesForWholeseller(query: any, userCategories: any[]) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 15;
    // const category_id: string = query.categoryId;
    const searchQuery = query.search;
    let categories: object[];
    let totalDocuments: any;

    let userCategoriesIds: any = await Promise.all(
      userCategories.map((category) => {
        return new mongoose.Types.ObjectId(category.categoryId);
      }),
    );

    const regx = new RegExp(searchQuery);
    const andfilters = [
      {
        $or: [
          { name: { $regex: regx, $options: 'i' } },
          { description: { $regex: regx, $options: 'i' } },
        ],
      },
    ];

    // console.log(userCategoriesIds);

    // @ts-ignore
    andfilters.push({ $expr: { $not: { $in: ['$_id', userCategoriesIds] } } });
    // andfilters.push({ $expr: { $nin: ['$_id', userCategoriesIds] } });

    // console.log(andfilters);

    // if (searchQuery) {
    //   andfilters.push({
    //     // @ts-ignore
    //     $or: [
    //       { name: { $regex: regx, $options: 'i' } },
    //       { description: { $regex: regx, $options: 'i' } },
    //     ],
    //   });
    // }
    // console.log('userCategoriesIds ====>', userCategoriesIds);

    categories = await this.categoryModel

      .aggregate([
        {
          $match: {
            $and: andfilters,
          },
        },
      ])
      .skip((page - 1) * limit)
      .limit(limit)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });

    if (!categories) throw new NotFoundException('Products not Found');

    const itemCount = await this.categoryModel.aggregate([
      {
        $match: {
          $and: andfilters,
        },
      },
      { $count: 'totalDocuments' },
    ]);

    totalDocuments = itemCount[0]?.totalDocuments;

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      curruntPage: page,
      limit,
      totalPages,
      totalDocuments,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      itemList: categories,
    };

    return result;
  }

  //Adding Category through XLSX
  async updateCategoryXlsx(CreateCategoryDto: any[]) {
    try {
      let allProducts = await this.categoryModel.find();
      const adding = [];
      const updating = [];
      await Promise.all(
        CreateCategoryDto.map(async (variant) => {
          if (!variant._id) {
            adding.push(variant);
          } else {
            updating.push(variant);
          }
        }),
      );

      // function arr_diff(a1: any[], a2: any[]) {
      //   var a = [],
      //     diff = [];

      //   for (var i = 0; i < a1.length; i++) {
      //     a[a1[i]] = true;
      //   }

      //   for (var i = 0; i < a2.length; i++) {
      //     if (a[a2[i]]) {
      //       delete a[a2[i]];
      //     } else {
      //       a[a2[i]] = true;
      //     }
      //   }

      //   for (var k in a) {
      //     diff.push(k);
      //   }

      //   return diff;
      // }

      // const arr1 = updating.map(
      //   (item) => new mongoose.Types.ObjectId(item._id),
      // );
      // const arr2 = allProducts.map((item) => item._id);
      // const deleting = arr_diff(arr1, arr2);

      // console.log('adding ===>', adding);
      // console.log('updating ===>', updating);
      // console.log('deleting ===>', deleting);

      // await Promise.all(
      //   deleting.map(async (del) => {
      //     return await this.categoryModel
      //       .deleteOne({ _id: new mongoose.Types.ObjectId(del) })
      //       .catch((err) => {
      //         // this.Logger.error(`error at ${del}`);
      //         throw new InternalServerErrorException(err);
      //       });
      //   }),
      // );

      await Promise.all(
        updating.map(async (del) => {
          return await this.categoryModel
            .findByIdAndUpdate({ _id: del._id }, del)
            .catch((err) => {
              // this.logger.error(`error at ${del}`);
              throw new InternalServerErrorException(err);
            });
        }),
      );
      await Promise.all(
        CreateCategoryDto.map(async (del) => {
          const variantExists = await this.categoryModel.findOne({
            slug: del.slug,
          });
          if (!variantExists) {
            // throw new BadRequestException(
            //   'Product Variant with this sku already exists',
            // );
            const newVariant = await new this.categoryModel(del).save();
          } else {
            const newVariant = await this.categoryModel.findByIdAndUpdate(
              variantExists?._id,
              del,
            );
          }
        }),
      );
      // console.log('aa', adding.length, updating.length, deleting.length);

      return {
        success: true,
      };
    } catch (err) {
      console.log(err);
      return new InternalServerErrorException(err);
    }
  }
}
