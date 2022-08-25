import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Mongoose } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { log } from 'console';
import { ObjectId } from 'mongoose';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { Category, CategoryDocument } from 'src/ctegory/category.schema';
import { WholesellersService } from 'src/wholesellers/wholesellers.service';
import { NotificationService } from 'src/notification/notification.service';
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private notificationServer: NotificationGateway,
    private wholesellersService: WholesellersService,
    private notificationService: NotificationService,
  ) {}

  async createProduct(product: CreateProductDto) {
    const exists = await this.productModel.findOne({ slug: product.slug });
    if (exists)
      throw new BadRequestException(
        `slug-${product.slug} already exists, slug must be unique`,
      );
    const currentProductCategory: any = await this.categoryModel.findById(
      product.category,
    );

    return await new this.productModel(product)
      .save()
      .then(() => {
        this.notificationServer.server.emit('notification', {
          message: `New Product Added in Category: ${currentProductCategory.name} | Product Name: ${product.product_name}`,
          type: 'CREATE',
          data: product,
        });
      })
      .catch((err) => {
        throw new InternalServerErrorException(err, 'Product Creation Faileds');
      });
  }

  //? CreateBulk
  async createProductBulk(product: CreateProductDto[]) {
    // const exists = await this.productModel.findOne({ slug: product.slug });
    // if (exists)
    //   throw new BadRequestException(
    //     `slug-${product.slug} already exists, slug must be unique`,
    //   );
    return await this.productModel.insertMany(product).catch((err) => {
      throw new InternalServerErrorException(err, 'Product Creation Faileds');
    });
  }

  async getAllProduct(page: number) {
    const prod = await this.productModel.find().catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (page) {
      const results = {};
      const limit = 15;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      if (endIndex < Product.length) {
        results['next'] = Number(page) + 1;
      }
      if (startIndex > 0) {
        results['previous'] = Number(page - 1);
      }
      results['page'] = Number(page);
      results['data'] = prod.slice(startIndex, endIndex);
      return {
        ...results,
      };
    } else {
      return prod;
    }
  }

  async getPagination(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 15;
    const category_id: string = query.categoryId;
    const searchQuery = query.search;
    let products: object[];
    let totalDocuments: any;
    const andfilters = [{ category: new mongoose.Types.ObjectId(category_id) }];

    // const exist = await this.productModel
    //   .find({ category: category_id })
    //   .catch((err) => {
    //     throw new InternalServerErrorException(err);
    //   });

    // if (!exist) throw new NotFoundException('Product not Found');

    if (searchQuery) {
      const regx = new RegExp(searchQuery);
      andfilters.push({
        // @ts-ignore
        $or: [
          { product_name: { $regex: regx, $options: 'i' } },
          { product_desc: { $regex: regx, $options: 'i' } },
        ],
      });
    }

    products = await this.productModel
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

    if (!products) throw new NotFoundException('Products not Found');

    const itemCount = await this.productModel.aggregate([
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
      itemList: products,
    };

    return result;
  }

  async getProductById(id: string) {
    const Product = await this.productModel.findById(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (!Product) throw new NotFoundException('Product not Found');
    return Product;
  }

  async getProductByCategory(id: string) {
    const products = await this.productModel
      .find({ category: id })
      .catch((err) => {
        console.log(err);
        throw new InternalServerErrorException(err);
      });
    if (!products) throw new NotFoundException('Products not Found');
    return products;
  }

  async getProductBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug }).catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (!product) throw new NotFoundException('product not Found');
    return product;
  }

  async updateProduct(productId: string, product: UpdateProductDto) {
    const exists: any = await this.productModel
      .findById(productId)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
    if (!exists) throw new NotFoundException('Product not Found');
    return await this.productModel
      .findByIdAndUpdate(productId, product)
      .then(async () => {
        if (
          exists?.price_wholesale !== product?.price_wholesale ||
          exists?.price_retail !== product?.price_retail ||
          exists?.mrp !== product?.mrp
        ) {
          const usersWithSameCategory =
            await this.wholesellersService.findUserByCategoryId(
              exists?.category,
            );
          console.log('usersWithSameCategory', usersWithSameCategory);

          await Promise.all(
            usersWithSameCategory.map(async (user) => {
              await this.notificationService
                .pushNotification({
                  userId: user._id.toString(),
                  message: `${product.product_name}'s Price Updated`,
                })
                .then((res: any) => {
                  console.log('after updating the pushed notification', res);
                  this.notificationServer.server
                    .to(res.socketId)
                    .emit('notification', {
                      message: `${product.product_name}'s Price Updated`,
                      type: 'UPDATE',
                      data: { ...product, category: exists?.category },
                    });
                });
            }),
          );
        }
      })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  async deleteProduct(id: string) {
    return await this.productModel.findByIdAndDelete(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  // async getAllProductCategories() {
  //   return await this.categoryModel.find().catch((err) => {
  //     throw new InternalServerErrorException(err);
  //   });
  // }

  //Adding By XLS

  async updateProductBulk(createProductDto: any[]) {
    try {
      let allProducts = await this.productModel.find({
        category: createProductDto[0]?.category,
      });
      const adding = [];
      const updating = [];
      await Promise.all(
        createProductDto.map(async (variant) => {
          if (!variant._id) {
            adding.push(variant);
          } else {
            updating.push(variant);
          }
        }),
      );

      function arr_diff(a1: any[], a2: any[]) {
        var a = [],
          diff = [];

        for (var i = 0; i < a1.length; i++) {
          a[a1[i]] = true;
        }

        for (var i = 0; i < a2.length; i++) {
          if (a[a2[i]]) {
            delete a[a2[i]];
          } else {
            a[a2[i]] = true;
          }
        }

        for (var k in a) {
          diff.push(k);
        }

        return diff;
      }

      const arr1 = updating.map(
        (item) => new mongoose.Types.ObjectId(item._id),
      );
      const arr2 = allProducts.map((item) => item._id);
      console.log('arr2 ==>', arr2);

      const deleting = arr_diff(arr1, arr2);

      // console.log('adding ===>', adding);
      // console.log('updating ===>', updating);
      // console.log('deleting ===>', deleting);

      await Promise.all(
        deleting.map(async (del) => {
          return await this.productModel
            .deleteOne({ _id: new mongoose.Types.ObjectId(del) })
            .catch((err) => {
              // this.Logger.error(`error at ${del}`);
              throw new InternalServerErrorException(err);
            });
        }),
      );
      await Promise.all(
        updating.map(async (del) => {
          const product = await this.productModel.findById(del?._id);
          if (
            del?.price_wholesale !== product?.price_wholesale ||
            del?.price_retail !== product?.price_retail ||
            del?.mrp !== product?.mrp
          ) {
            const usersWithSameCategory =
              await this.wholesellersService.findUserByCategoryId(
                del?.category,
              );

            await Promise.all(
              usersWithSameCategory.map(async (user) => {
                await this.notificationService
                  .pushNotification({
                    userId: user._id.toString(),
                    message: `${product.product_name}'s Price Updated`,
                  })
                  .then((res: any) => {
                    console.log('after updating the pushed notification', res);
                    this.notificationServer.server
                      .to(res.socketId)
                      .emit('notification', {
                        message: `${product.product_name}'s Price Updated`,
                        type: 'UPDATE',
                        data: { ...product, category: del?.category },
                      });
                  });
              }),
            );

            del;
          }
          return await this.productModel
            .findByIdAndUpdate({ _id: del._id }, del)
            .catch((err) => {
              // this.logger.error(`error at ${del}`);
              throw new InternalServerErrorException(err);
            });
        }),
      );
      await Promise.all(
        createProductDto.map(async (del) => {
          const variantExists = await this.productModel.findOne({
            slug: del.slug,
          });
          if (!variantExists) {
            // throw new BadRequestException(
            //   'Product Variant with this sku already exists',
            // );
            const newVariant = await new this.productModel(del).save();
          } else {
            const newVariant = await this.productModel.findByIdAndUpdate(
              variantExists?._id,
              del,
            );
          }
        }),
      );
      // console.log('aa', adding.length, updating.length, deleting.length);
      return;
    } catch (err) {
      console.log(err);
      return new InternalServerErrorException(err);
    }
  }
}
