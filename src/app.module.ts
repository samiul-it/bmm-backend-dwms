import { Module } from '@nestjs/common';
// import { userInfo } from 'os';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './ctegory/category.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { UserModule } from './user/user.module';
import { ProductModule } from './products/product.module';
import { AuthModule } from './auth/auth.module';
import { CouponsModule } from './coupons/coupons.module';
import { SubCategoryModule } from './subcategory/subcategory.module';
import { WholesellersModule } from './wholesellers/wholesellers.module';
import { OrdersModule } from './orders/orders.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { NotificationModule } from './notification/notification.module';
import { CategoryrequestModule } from './categoryrequest/categoryrequest.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          // service: configService.get('SMTP_SERVICE'),
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_API_KEY'),
          },
        },
        template: {
          dir: join(__dirname, 'views'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DB_URI'),
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }),
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        level: 'error',
        format: winston.format.json(),
        transports: [
          new winston.transports.Console({
            format: winston.format.simple(),
          }),
        ],
      }),
    }),
    UserModule,
    CouponsModule,
    CategoryModule,
    ProductModule,
    SubCategoryModule,
    AuthModule,
    WholesellersModule,
    OrdersModule,
    NotificationModule,
    CategoryrequestModule,
    ActivityLogsModule,
    CloudinaryModule,

    // SmsModule,
    // EmailModule,
    // ShippingModule,
    // StorageModule,
    // CustomerModule,
    // WatiModule,
    // WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryProvider],
})
export class AppModule {}
