import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { productController } from './product.controller';
import { PassportModule } from '@nestjs/passport';
import { ProductService } from './product.services';
import { Category, CategorySchema } from 'src/ctegory/category.schema';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from 'src/notification/notification.module';
import { WholesellersModule } from 'src/wholesellers/wholesellers.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NotificationModule,
    UserModule,
    ConfigModule,
    JwtModule,
    WholesellersModule,
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
