import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user/user.schema';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    // console.log(req.user)
    return req.user;
  },
);
