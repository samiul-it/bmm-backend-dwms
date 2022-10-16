import { Module } from '@nestjs/common';
// import { SmsModule } from '../sms/sms.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { CustomerModule } from '../customer/customer.module';
import { WholesellersModule } from 'src/wholesellers/wholesellers.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });
@Module({
  imports: [
    ConfigModule,
    WholesellersModule,
    passportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: 3600,
        },
      }),
    }),
    // SmsModule,
    UserModule,
    // CustomerModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, passportModule],
})
export class AuthModule {}
