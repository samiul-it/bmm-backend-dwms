import { Module } from '@nestjs/common';
import { WholesellersService } from './wholesellers.service';
import { WholesellersController } from './wholesellers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wholesellers, WholesellersSchema } from './wholesellers.schema';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      {
        name: Wholesellers.name,
        schema: WholesellersSchema,
      },
    ]),
  ],
  controllers: [WholesellersController],
  providers: [WholesellersService],
  exports: [WholesellersService],
})
export class WholesellersModule {}
