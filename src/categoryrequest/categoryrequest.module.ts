import { Module } from '@nestjs/common';
import { CategoryrequestService } from './categoryrequest.service';
import { CategoryrequestController } from './categoryrequest.controller';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryReq, CategoryReqSchema } from './categoryrequest.schema';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      {
        name: CategoryReq.name,
        schema: CategoryReqSchema,
      },
    ]),
  ],

  controllers: [CategoryrequestController],
  providers: [CategoryrequestService],
  exports: [CategoryrequestService],
})
export class CategoryrequestModule {}
