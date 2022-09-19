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
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private notificationServer: NotificationGateway,
    private activityLogsService: ActivityLogsService,
  ) {}

  async generateSlug(slug: string) {
    const f = String(slug).toLowerCase();
    return f.replace(/ /g, '_');
  }

  async createCategory(category: CreateCategoryDto, user: any) {
    const exists = await this.categoryModel.findOne({ name: category?.name });
    const newSlug = await this.generateSlug(category?.name);

    if (exists)
      throw new BadRequestException(
        `Category-${category?.name} already exists, Category Name must be unique`,
      );
    return await new this.categoryModel({ ...category, slug: newSlug })
      .save()
      .then(async (res) => {
        await this.notificationServer.server.emit('notification', {
          message: `New Category Added "${res?.name}"`,
          data: category,
        });

        await this.activityLogsService.createActivityLog(
          user?._id,
          `New Category Added: ${res?.name} | Created By: ${user?.name}`,
        );
      })
      .catch((err) => {
        throw new InternalServerErrorException(err, 'Category Creation Failed');
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

  async updateCategory(
    categoryId: string,
    category: UpdateCategoryDto,
    user: any,
  ) {
    const exists = await this.categoryModel
      .findById(categoryId)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
    if (!exists) throw new NotFoundException('Category not Found');
    return await this.categoryModel
      .findByIdAndUpdate(categoryId, category, { new: true })
      .then(async (res: any) => {
        await this.activityLogsService.createActivityLog(
          user?._id,
          `Category Name Updated: ${exists?.name} to ${res?.name} | Updated By: ${user?.name}`,
        );
      })
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
      const category: any = await this.categoryModel
        .findByIdAndDelete(id)
        .then(async (res) => {
          await this.activityLogsService.createActivityLog(
            admin?._id,
            `Category Deleted: ${res?.name} | Deleted By: ${admin?.name}`,
          );

          return res;
        })
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
  async updateCategoryXlsx(CreateCategoryDto: any[], user: any) {
    try {
      let allProducts = await this.categoryModel.find();
      const adding = [];
      const updating = [];
      const createCategory2: any = await Promise.all(
        CreateCategoryDto.map(async (variant) => {
          if (!variant._id) {
            variant['slug'] = await this.generateSlug(variant?.name);

            adding.push({
              ...variant,
              slug: await this.generateSlug(variant?.name),
            });
          } else {
            updating.push(variant);
          }
          return variant;
        }),
      );

      await Promise.all(
        updating.map(async (del) => {
          return await this.categoryModel
            .findByIdAndUpdate({ _id: del._id }, del)
            .then(async (res) => {
              await this.activityLogsService.createActivityLog(
                user?._id,
                `Category (bulk) Updated: ${res?.name} | Updated By: ${user?.name}`,
              );
            })
            .catch((err) => {
              // this.logger.error(`error at ${del}`);
              throw new InternalServerErrorException(err);
            });
        }),
      );
      await Promise.all(
        adding.map(async (del) => {
          const variantExists = await this.categoryModel.findOne({
            name: del?.name,
          });
          if (!variantExists) {
            // throw new BadRequestException(
            //   'Product Variant with this sku already exists',
            // );
            await new this.categoryModel(del).save().catch((err) => {
              console.log('upate Bulk ->', err);

              throw new InternalServerErrorException(err);
            });
          } else {
            throw new InternalServerErrorException(
              `Category-${variantExists?.name} already exists, Category Name must be unique`,
            );
          }
        }),
      );
      // console.log('aa', adding.length, updating.length, deleting.length);

      // return {
      //   success: true,
      // };
    } catch (err) {
      console.log(err);
      return new InternalServerErrorException(err);
    }
  }
}
