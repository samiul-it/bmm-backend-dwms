import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryRequestDocument, CategoryReq } from './categoryrequest.schema';
import { CreateCategoryrequestDto } from './dto/create-categoryrequest.dto';
import { UpdateCategoryrequestDto } from './dto/update-categoryrequest.dto';

@Injectable()
export class CategoryrequestService {
  constructor(
    @InjectModel(CategoryReq.name)
    private reqModel: Model<CategoryRequestDocument>,
  ) {}
  create(createCategoryrequestDto: CreateCategoryrequestDto) {
    return 'This action adds a new categoryrequest';
  }

  async manageRequests(newRequest: CreateCategoryrequestDto) {
    // console.log(newRequest);
    const exists = await this.reqModel.findOne({
      wholesellerId: newRequest.wholesellerId,
    });

    // console.log(exists._id);

    if (exists) {
      return await this.reqModel
        .findByIdAndUpdate(exists._id, newRequest)
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
    } else {
      return await new this.reqModel({ ...newRequest }).save().catch((err) => {
        throw new InternalServerErrorException(
          err,
          'Wholeseller Creation Failed',
        );
      });
    }
  }

  // Getting all Requests

  async getAllCategories() {
    const prod = await this.reqModel.find().catch((err) => {
      throw new InternalServerErrorException(err);
    });
    return prod;
  }

  // Getting category by wholeseller

  async getCategoriesByWholeseller(id) {
    // console.log(id);
    
    const currentRequest = await this.reqModel
      .findOne({
        wholesellerId: id,
      })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
    // console.log(currentRequest);
    
    return currentRequest;
  }

  // Deleting a Category Request

  async deleteCategoryRequest(id: string) {
    const requestedCategory = await this.reqModel.findById(id);
    if (!requestedCategory)
      throw new NotFoundException('Requested Category not found');
    return await this.reqModel.findByIdAndDelete(id);
  }

  findAll() {
    return `This action returns all categoryrequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryrequest`;
  }

  update(id: number, updateCategoryrequestDto: UpdateCategoryrequestDto) {
    return `This action updates a #${id} categoryrequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryrequest`;
  }
}
