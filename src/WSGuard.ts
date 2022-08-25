import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { WholesellersService } from 'src/wholesellers/wholesellers.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    // private userService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: any) {
    const bearerToken =
      context.args[0].handshake.headers.authorization.split(' ')[1];
    try {
      // console.log('bearerToken ==>', bearerToken);

      if (bearerToken !== undefined) {
        const decoded = jwt.verify(
          bearerToken,
          this.configService.get('JWT_SECRET'),
        ) as any;
        // console.log('decoded ==>', decoded);
        return decoded;
      } else {
        console.log('authorization Failed');
      }

      // return new Promise(async (resolve, reject) => {
      //   if (decoded.role === 'wholeseller') {
      //     return await this.wholesellerService
      //       .findOne(decoded.userId)
      //       .then((user) => {
      //         if (user) {
      //           resolve(user);
      //         } else {
      //           reject(false);
      //         }
      //       });
      //   } else {
      //     return await this.userService
      //       .getUserById(decoded.userId)
      //       .then((user) => {
      //         if (user) {
      //           resolve(user);
      //         } else {
      //           reject(false);
      //         }
      //       });
      //   }

      //   // return this.userService
      //   //   .findByUsername(decoded.username)
      //   //   .then((user) => {
      //   //     if (user) {
      //   //       resolve(user);
      //   //     } else {
      //   //       reject(false);
      //   //     }
      //   //   });
      // });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}

// {
//   userId: 'weq-twqeqweqweqw-ewqeqweqw-qweqweqw',
//   socketId: '',
//   messages: []

// }
