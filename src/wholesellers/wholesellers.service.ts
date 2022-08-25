import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWholesellerDto } from './dto/create-wholeseller.dto';
import { UpdateWholesellerDto } from './dto/update-wholeseller.dto';
import { Wholesellers, WholesellersDocument } from './wholesellers.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class WholesellersService {
  constructor(
    @InjectModel(Wholesellers.name)
    private wholesellersModel: Model<WholesellersDocument>,
  ) {}

  // Creating a Wholeseller

  // async createWholeseller(cWDto: CreateWholesellerDto) {
  //   const exists = await this.wholesellersModel.findOne({ name: cWDto.name });
  //   console.log(cWDto);

  //   if (exists)
  //     throw new BadRequestException('wholeseller already exists');
  //   return await new this.wholesellersModel(cWDto).save().catch((err) => {

  //     throw new InternalServerErrorException(err, 'Failed To Create Wholeseller');
  //      console.log("ERROR");
  //   });
  // }

  async createWholeseller(wholeseller: CreateWholesellerDto) {
    const exists = await this.wholesellersModel.findOne({
      phone: wholeseller.phone,
    });
    if (exists)
      throw new BadRequestException(
        `Wholeseller-${wholeseller.phone} already exists`,
      );

    // console.log(wholeseller);

    const hash = await bcrypt.hash(wholeseller.password, 12);
    return await new this.wholesellersModel({ ...wholeseller, password: hash })
      .save()
      .catch((err) => {
        throw new InternalServerErrorException(
          err,
          'Wholeseller Creation Failed',
        );
      });
  }

  // Getting all Wholesellers

  async getAllWholesellers() {
    const prod = await this.wholesellersModel.find().catch((err) => {
      throw new InternalServerErrorException(err);
    });
    return prod;
  }

  // Updating a wholeseller

  async updateWholeseller(
    wholesellerId: string,
    wholeseller: UpdateWholesellerDto,
  ) {
    const exists = await this.wholesellersModel
      .findById(wholesellerId)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
    if (!exists) throw new NotFoundException('user Not Found');
    return await this.wholesellersModel
      .findByIdAndUpdate(wholesellerId, wholeseller)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  // Resetting a wholeseller Password

  async resetWholesellerPassword(
    wholesellerId: string,
    wholeseller: UpdateWholesellerDto,
    cu: any,
  ): Promise<
    Wholesellers &
      import('mongoose').Document<any, any, any> & {
        _id: import('mongoose').Types.ObjectId;
      }
  > {
    // console.log(cu.password);

    if (await bcrypt.compare(wholeseller.password, cu.password)) {
      const exists = await this.wholesellersModel
        .findById(wholesellerId)
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
      if (!exists) throw new NotFoundException('Wholeseller Not Found');

      const hash = await bcrypt.hash(wholeseller.newPassword, 12);
      return await this.wholesellersModel
        .findByIdAndUpdate(wholesellerId, { ...wholeseller, password: hash })
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
    } else {
      throw new BadRequestException('Password Did not matched');
    }
  }

  //Deleting a wholeseller
  async deleteWholeseller(id: string) {
    return await this.wholesellersModel.findByIdAndDelete(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  //Add wholesellers through XLS

  async createWholesellersBulk(wholesellers: CreateWholesellerDto[]) {
    console.log(wholesellers);
    return await this.wholesellersModel
      .insertMany(wholesellers)
      .catch((err) => {
        throw new InternalServerErrorException(
          err,
          'Bulk Wholeseller Creation Failed',
        );
      });
  }

  async getWholesellerByPhone(phone: string) {
    const user = await this.wholesellersModel.findOne({ phone });
    if (!user) throw new NotFoundException('Wholeseller not found');
    return user;
  }

  //To Impliment Wholeseller Login through Email

  async verifyEmailPassword(email: string, password: string) {
    // check if user exists
    const wholeseller = await this.wholesellersModel.findOne({ email });
    // if (!wholeseller) throw new BadRequestException('Wholeseller Service: Incorrect email or password');
    if (!wholeseller) return false;

    // check password

    return await bcrypt.compare(password, wholeseller.password);
  }

  async getWholesellerByEmail(email: string) {
    const user = await this.wholesellersModel.findOne({ email });
    if (!user) throw new NotFoundException('Wholeseller not found');
    return user;
  }

  findAll() {
    return `This action returns all wholesellers`;
  }

  async findOne(id: string) {
    const exists = await this.wholesellersModel.findById(id).catch((err) => {
      throw new InternalServerErrorException(err);
    });
    if (!exists) throw new NotFoundException('Wholeseller Not Found');
    return exists;
  }

  update(id: number, updateWholesellerDto: UpdateWholesellerDto) {
    return `This action updates a #${id} wholeseller`;
  }

  remove(id: number) {
    return `This action removes a #${id} wholeseller`;
  }

  //Adding through XLSX
  async updateWholesellersXlsx(CreateWholesellerDto: any[]) {
    try {
      let productVariants = await this.wholesellersModel.find();
      const adding = [];
      const updating = [];
      await Promise.all(
        CreateWholesellerDto.map(async (variant) => {
          if (!variant._id) {
            adding.push(variant);
          } else {
            updating.push(variant);
          }
        }),
      );

      const deleting = await productVariants.filter(
        ({ _id: id1 }) => !updating.some(({ _id: id2 }) => id2 === id1),
      );
      await Promise.all(
        deleting.map(async (del) => {
          return await this.wholesellersModel
            .deleteOne({ _id: del._id })
            .catch((err) => {
              // this.Logger.error(`error at ${del}`);
              throw new InternalServerErrorException(err);
            });
        }),
      );
      await Promise.all(
        updating.map(async (del) => {
          return await this.wholesellersModel
            .updateOne({ _id: del._id }, del)
            .catch((err) => {
              // this.logger.error(`error at ${del}`);
              throw new InternalServerErrorException(err);
            });
        }),
      );
      await Promise.all(
        CreateWholesellerDto.map(async (del) => {
          const variantExists = await this.wholesellersModel.findOne({
            sku: del.sku,
          });
          if (!variantExists) {
            // throw new BadRequestException(
            //   'Product Variant with this sku already exists',
            // );
            const newVariant = await new this.wholesellersModel(del).save();
          } else {
            const newVariant = await this.wholesellersModel.findByIdAndUpdate(
              variantExists?._id,
              del,
            );
          }
        }),
      );
      console.log('aa', adding.length, updating.length, deleting.length);
      return;
    } catch (err) {
      console.log(err);
      return new InternalServerErrorException(err);
    }
  }

  async findUserByCategoryId(id: string) {
    return await this.wholesellersModel.aggregate([
      {
        $match: {
          catagories: {
            $elemMatch: { categoryId: new mongoose.Schema.Types.ObjectId(id) },
          },
        },
      },
      //@ts-ignore
      { $group: { _id: '$id' } },
    ]);
  }
}
