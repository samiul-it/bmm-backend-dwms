import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/user.schema';

export const AdminUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();

    if (req?.user?.role === 'admin') {
      return req.user;
    } else {
      throw new UnauthorizedException();
    }
  },
);
