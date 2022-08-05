import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/update-role.dto';
import { UserService } from './user.service';
import { IsPhoneNumber } from 'class-validator';
import { identity } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { AdminUser } from 'src/auth/admin-user.decorator';

class CustomerPhoneDto {
  @IsPhoneNumber('IN')
  phone: string;
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async allUser(@Query('page') page: number) {
    return await this.userService.getAllBackendUsers(page);
  }

  @UseGuards(AuthGuard())
  @Post('/create')
  async create(@Body() user: CreateUserDto, @AdminUser() admin: any) {
    return await this.userService.createBackendUser(user);
  }

  @Post('/update-role')
  async updateRole(@Body() dto: UpdateUserRoleDto) {
    return await this.userService.updateBackendUserRole(dto);
  }

  @Get('/phone/:phone')
  async getUserByPhone(@Param('phone') phone: string) {
    return await this.userService.getUserByPhone(phone);
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Put('/:id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return await this.userService.updateBackendUser(user, id);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}
