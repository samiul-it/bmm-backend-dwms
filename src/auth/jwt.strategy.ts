import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { JwtPayload } from './jwt-payload.interface';
// import { CustomerService } from 'src/customer/customer.service';
import { WholesellersService } from './../wholesellers/wholesellers.service';

const tokenExtractor = (req) => {
  const token = req.headers['authorization'];

  // console.log("Header",req.headers['authorization']);

  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userSerive: UserService,
    private configService: ConfigService,
    private wholesellerService: WholesellersService, // private customerService: CustomerService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: tokenExtractor,
    });
  }

  async validate(payload: JwtPayload) {
    const { userId, role } = payload;

    // console.log('Payload', payload);
    // console.log('Role', role);

    let user: any;

    // console.log('Role', role);

    if (role === 'wholeseller') {
      user = await this.wholesellerService.findOne(userId);
    } else {
      user = await this.userSerive.getUserById(userId);
    }

    if (!user) throw new UnauthorizedException();
    // console.log('User', user);

    return user;
  }
}
