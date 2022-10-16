import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// import { CustomerController } from '../customer/customer.controller';
// import { CustomerService } from '../customer/customer.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [
    UserController,
    // CustomerController
  ],
  providers: [
    UserService,
    // CustomerService
  ],
  exports: [
    UserService,
    // CustomerService
  ],
})
export class UserModule {}
