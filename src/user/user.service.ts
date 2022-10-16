import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './user.schema';
import { UpdateUserRoleDto, UpdateUserDto } from './dto/update-role.dto';
import { UpdateUserPassDto } from './dto/update-user-pass.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createBackendUser(user: CreateUserDto) {
    // check if user exists
    const exists = await this.userModel.findOne({
      $or: [{ email: user.email }, { phone: user.phone }],
    });
    if (exists) throw new BadRequestException('User already exists');

    // hash password
    const hash = await bcrypt.hash(user.password, 12);
    // this.logger.log('New Backend User Created');
    return await new this.userModel({ ...user, password: hash })
      .save()
      .catch((err) => {
        console.log(
          'file: user.service.ts ~ line 37 ~ createBackendUser ~ err',
          err,
        );
        throw new InternalServerErrorException(err);
      });
  }

  async verifyEmailPassword(email: string, password: string) {
    // check if user exists
    const user = await this.userModel.findOne({ email });
    if (!user) return false;
    // if (!user) throw new BadRequestException('User Service: Incorrect email or password');
    // check password
    return await bcrypt.compare(password, user.password);
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByPhone(phone: string) {
    const user = await this.userModel.findOne({ phone: phone });
    // console.log(user);
    return user;
  }

  //Reset User Password

  async resetUserPassword(id: string, user: UpdateUserPassDto, admin: any) {
    // console.log(await bcrypt.compare(user.password, admin.password));

    if (await bcrypt.compare(user.password, admin.password)) {
      const exists = await this.userModel.findById(id);
      if (!exists) throw new NotFoundException('User not found');
      const hash = await bcrypt.hash(user.newPassword, 12);
      return await this.userModel.findByIdAndUpdate(id, {
        ...user,
        password: hash,
      });
    } else {
      throw new BadRequestException('Password Did not matched');
    }
  }

  // async searchUserByPhone(phone: string) {
  //   await this.userModel.createIndexes({ name: 'name' },{ phone: 'text' });
  //   const user = await this.userModel.aggregate([
  //     {
  //       $search: {
  //         compound: {
  //           filter: [
  //             {
  //               text: { path: 'city', query: 'New York' },
  //             },
  //           ],
  //           must: [
  //             {
  //               autocomplete: {
  //                 query: `${phone}`,
  //                 path: 'phone',
  //                 fuzzy: {
  //                   maxEdits: 2,
  //                   prefixLength: 3,
  //                 },
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   ]);

  //   if (!user) throw new NotFoundException('User not found');
  //   return user;
  // }
  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateBackendUserRole(dto: UpdateUserRoleDto) {
    const exists = await this.userModel.findById(dto.userId);
    if (!exists) throw new NotFoundException('User not Found');
    return await this.userModel.findByIdAndUpdate(dto.userId, {
      role: dto.role,
    });
  }

  async updateBackendUser(user: UpdateUserDto, id: string) {
    const { phone, email, name } = user;
    const exists = await this.userModel.findById(id);
    if (!exists) throw new NotFoundException('User not found');
    return await this.userModel.findByIdAndUpdate(id, { phone, email, name });
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return await this.userModel.findByIdAndDelete(id);
  }

  async getAllBackendUsers(page: number) {
    const user = await this.userModel.find({ role: { $ne: 'user' } });
    if (page) {
      const results = {};
      const limit = 15;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      if (endIndex < user.length) {
        results['next'] = Number(page) + 1;
      }
      if (startIndex > 0) {
        results['previous'] = Number(page - 1);
      }
      results['page'] = Number(page);
      results['data'] = user.slice(startIndex, endIndex);
      return { ...results };
    } else {
      return user;
    }
  }

  async createUser(phone: string) {
    // console.log(phone);
    const user = await this.userModel.findOne({ phone });
    if (user) throw new NotFoundException('User already exist found');
    return await new this.userModel({ phone: phone }).save().catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }
}
