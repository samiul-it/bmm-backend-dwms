import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// import { SendOtpDto } from './dto/send-otp.dto';
// import { SmsService } from '../sms/sms.service';
// import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from 'src/user/user.schema';
// import { CustomerService } from '../customer/customer.service';
import { WholesellersService } from './../wholesellers/wholesellers.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private wholesellerService: WholesellersService,
  ) {}

  //   async sendOtp(dto: SendOtpDto) {
  //     return await this.smsService.sendOtp(dto.phone);
  //   }

  //   async resendOtp(dto: SendOtpDto) {
  //     return await this.smsService.resendOtp(dto.phone);
  //   }

  //   async verifyOtp(dto: VerifyOtpDto, res: Response) {
  //     const verified = await this.smsService.verifyOtp(dto.phone, dto.otp);
  //     if (!verified) throw new BadRequestException('Incorrect OTP');
  //     let user = await this.customerService.getCustomerByPhone(dto.phone);
  //     if (!user) {
  //       user = await this.customerService.createCustomer(dto.phone);
  //     }
  //     // TODO: Send Jwt Cookie
  // const token = await this.jwtService.signAsync(
  //   { userId: User._id, role: User.role },
  //   {
  //     expiresIn: '365d',
  //   },
  // );
  // res.cookie('authorization', `Bearer ${token}`, {
  //   httpOnly: true,
  //   secure: true,
  //   maxAge: Date.now() + 10 * 365 * 24 * 60 * 60,
  //   sameSite: 'lax',
  // });

  async signup(phone: string, res: Response) {
    const newUser = await this.userService.createUser(phone);
    const token = await this.jwtService.signAsync(
      { userId: newUser._id },
      {
        expiresIn: '365d',
      },
    );
    res.cookie('authorization', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      maxAge: Date.now() + 10 * 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }

  async signIn(phone: string, res: Response) {
    const user = await this.userService.getUserByPhone(phone);
    // const user = await this.userService.getUserByPhone(phone); Wholeseller

    const wholeseller = await this.wholesellerService.getWholesellerByPhone(
      phone,
    );

    //If user doesnt exist find into wholesellers

    if (!wholeseller)
      throw new NotFoundException('Wholeseller account not found');
    if (!user) throw new NotFoundException('User account not found');
    const token = await this.jwtService.signAsync(
      { userId: user._id },
      {
        expiresIn: '365d',
      },
    );
    res.cookie('authorization', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      maxAge: Date.now() + 10 * 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });
  }

  async signInWithEmail(dto: SignInDto, res: Response) {
    //user checking
    const validUser = await this.userService.verifyEmailPassword(
      dto.email,
      dto.password,
    );

    if (!validUser) {
      //checking wholeseller
      const validWholeseller =
        await this.wholesellerService.verifyEmailPassword(
          dto.email,
          dto.password,
        );

      if (!validWholeseller)
        throw new BadRequestException(
          'Wholeseller: Incorrect email or password',
        );
      // console.log('executing at wholeseller....');

      const wholeseller = await this.wholesellerService.getWholesellerByEmail(
        dto.email,
      );

      // console.log( wholeseller);

      const token = await this.jwtService.signAsync(
        { userId: wholeseller._id, role: wholeseller.role },
        {
          expiresIn: '365d',
        },
      );

      return {
        // user: {
        //   _id: wholeseller._id,
        //   name: wholeseller.name,
        //   email: wholeseller.email,
        //   phone: wholeseller.phone,
        //   role: wholeseller.role,
        //   // @ts-ignore
        //   catagories: wholeseller.catagories,
        //   // @ts-ignore
        //   createdAt: wholeseller.createdAt,
        //   // @ts-ignore
        //   updatedAt: wholeseller.updatedAt,
        // },
        token,
      };
    }

    // console.log('executing....');

    if (!validUser)
      throw new BadRequestException('User:Incorrect email or password');

    const user = await this.userService.getUserByEmail(dto.email);

    const token = await this.jwtService.signAsync(
      { userId: user._id, role: user.role },
      {
        expiresIn: '365d',
      },
    );
    return {
      // user: {
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   phone: user.phone,
      //   role: user.role,
      //   // @ts-ignore
      //   catagories: user.catagories,
      //   // @ts-ignore
      //   createdAt: user.createdAt,
      //   // @ts-ignore
      //   updatedAt: user.updatedAt,
      // },
      token,
    };
  }

  async signInWithEmailWholeseller(dto: SignInDto, res: Response) {
    //Checking Valid User
    const validWholeseller = await this.wholesellerService.verifyEmailPassword(
      dto.email,
      dto.password,
    );

    console.log(validWholeseller);

    if (!validWholeseller)
      throw new BadRequestException('Wholeseller: Incorrect email or password');

    const wholeseller = await this.wholesellerService.getWholesellerByEmail(
      dto.email,
    );
    const token = await this.jwtService.signAsync(
      { userId: wholeseller._id, role: wholeseller.role },

      {
        expiresIn: '365d',
      },
    );
    return await res
      .cookie('authorization', `Bearer ${token}`, {
        httpOnly: true,
        secure: true,
        maxAge: Date.now() + 10 * 365 * 24 * 60 * 60,
        sameSite: 'lax',
      })
      .json({ wholeseller, token });

    // console.log('Token', token);
  }

  async signOut(res: Response) {
    res.cookie('authorization', `Bearer `, {
      httpOnly: true,
      secure: true,
      maxAge: 0,
      sameSite: 'lax',
    });
    res.end();
    return;
  }
}
