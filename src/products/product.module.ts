import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Category, CategorySchema } from 'src/ctegory/category.schema';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from 'src/notification/notification.module';
import { WholesellersModule } from 'src/wholesellers/wholesellers.module';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';
import { ProductService } from './product.services';
import { productController } from './product.controller';
import { Product, ProductSchema } from './product.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NotificationModule,
    UserModule,
    ConfigModule,
    JwtModule,
    WholesellersModule,
    ActivityLogsModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [productController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
