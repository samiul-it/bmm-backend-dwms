import { Body, Controller, Post, Res, UseGuards, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.schema';
import { AuthService } from './auth.service';
// import { SendOtpDto } from './dto/send-otp.dto';
import { SignInDto } from './dto/sign-in.dto';
// import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //   @Post('/send-otp')
  //   async sendOtp(@Body() dto: SendOtpDto) {
  //     return this.authService.sendOtp(dto);
  //   }

  //   @Post('/resend-otp')
  //   async resendOtp(@Body() dto: SendOtpDto) {
  //     return this.authService.resendOtp(dto);
  //   }

  @UseGuards(AuthGuard())
  @Get('/me')
  async currentUser(@CurrentUser() user: any) {
    // @ts-ignore
    // console.log(user);

    const { createdAt, updatedAt, password, __v, ...rest } = user.toJSON();

    return rest;
  }

  @Get('/current-user')
  async getCurrentUser(@CurrentUser() user: User) {
    console.log(user);
    return 'Current User API Called';
  }

  //   @Post('/verify-otp')
  //   async verifyOtp(
  //     @Body() dto: VerifyOtpDto,
  //     @Res({ passthrough: true }) res: Response,
  //   ) {
  //     return await this.authService.verifyOtp(dto, res);
  //   }

  @Post('/signin')
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // console.log(dto);
    return await this.authService.signInWithEmail(dto, res);
  }

  @Post('/signin-wholeseller')
  async signinwholeseller(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Wholeseller Dto', dto);
    return await this.authService.signInWithEmailWholeseller(dto, res);
  }

  @Post('/sign-out')
  async signOut(@Res() res: Response) {
    // console.log("Signed Out");

    return this.authService.signOut(res);
  }
}
