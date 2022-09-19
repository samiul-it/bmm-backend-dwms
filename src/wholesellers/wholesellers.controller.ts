import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { WholesellersService } from './wholesellers.service';
import { CreateWholesellerDto } from './dto/create-wholeseller.dto';
import { UpdateWholesellerDto } from './dto/update-wholeseller.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminUser } from 'src/auth/admin-user.decorator';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(AuthGuard())
@Controller('wholesellers')
export class WholesellersController {
  constructor(private readonly wholesellersService: WholesellersService) {}

  // @Post()
  // create(@Body() createWholesellerDto: CreateWholesellerDto) {
  //   return this.wholesellersService.create(createWholesellerDto);
  // }

  //Creating wholeseller
  //! Admin-Route --->
  @Post('/create')
  async create(
    @Body() createWholesellerDto: CreateWholesellerDto,
    @AdminUser() user: any,
  ) {
    return await this.wholesellersService.createWholeseller(
      createWholesellerDto,
      user,
    );
  }

  //Getting All Wholesellers
  @Get('/')
  async allWholesellers(@CurrentUser() user: any) {
    if (user.role === 'admin' || user.role === 'employee') {
      return await this.wholesellersService.getAllWholesellers();
    } else {
      throw new UnauthorizedException();
    }
  }

  //Updating a wholeseller
  //! Admin-Route --->
  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() wholeseller: UpdateWholesellerDto,
    @CurrentUser() user: any,
  ) {
    return await this.wholesellersService.updateWholeseller(
      id,
      wholeseller,
      user,
    );
  }

  //Changing wholesellers Password

  @Put('/reset-pass/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() wholeseller: UpdateWholesellerDto,
    @CurrentUser() cu: any,
  ) {
    // console.log('wholeseller', wholeseller);

    return await this.wholesellersService.resetWholesellerPassword(
      id,
      wholeseller,
      cu,
    );
  }

  //Deleting a wholeseller
  //! Admin-Route --->
  @Delete('/:id')
  async deleteWholeseller(@Param('id') id: string, @AdminUser() user: any) {
    return await this.wholesellersService.deleteWholeseller(id, user);
  }

  // Adding Multiple Wholesellers At Once
  //! Admin-Route --->
  @Post('/uploadxls')
  async createWholesellersBulk(
    @Body() wholesellers: CreateWholesellerDto[],
    @AdminUser() user: any,
  ) {
    return await this.wholesellersService.updateWholesellersXlsx(
      wholesellers,
      user,
    );
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.wholesellersService.findOne(id);
  }

  @Get('/phone/:phone')
  getWholesellerByPhone(@Param('phone') phone: string) {
    return this.wholesellersService.getWholesellerByPhone(phone);
  }

  @Get('/email/:email')
  getWholesellerByEmail(@Param('email') email: string) {
    return this.wholesellersService.getWholesellerByEmail(email);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateWholesellerDto: UpdateWholesellerDto) {
  //   return this.wholesellersService.update(+id, updateWholesellerDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wholesellersService.remove(+id);
  }

  //! Admin-Route --->
  @Post('/sendNotificationByCategoty')
  async sendNotificationByCategoty(@Body() body: any, @AdminUser() user: any) {
    const { wholesellersList, message } = body;
    return await this.wholesellersService.sendNotificationByCategory(
      wholesellersList,
      message,
      user,
    );
  }

  @Post('/findWholesellerByCategoryId')
  async findWholesellerByCategoryId(@Body() body: any, @AdminUser() user: any) {
    const { id } = body;
    return this.wholesellersService.findUserByMultipleCategoryId(id);
  }
}
