import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './product.schema';
import { productController } from './product.controller';
import { PassportModule } from '@nestjs/passport';
import { ProductService } from './product.services';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [productController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
