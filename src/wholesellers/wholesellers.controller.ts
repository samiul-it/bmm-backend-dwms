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
  @Post('/create')
  async create(
    @Body() createWholesellerDto: CreateWholesellerDto,
    @AdminUser() user: any,
  ) {
    return await this.wholesellersService.createWholeseller(
      createWholesellerDto,
    );
  }

  //Getting All Wholesellers
  @Get('/')
  async allWholesellers(user: any) {
    return await this.wholesellersService.getAllWholesellers();
  }

  //Updating a wholeseller

  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() wholeseller: UpdateWholesellerDto,
    @AdminUser() user: any,
  ) {
    return await this.wholesellersService.updateWholeseller(id, wholeseller);
  }

  //Changing wholesellers Password

  @Put('/reset-pass/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() wholeseller: UpdateWholesellerDto,
    @CurrentUser() cu:any,
  ) {
    // console.log('wholeseller', wholeseller);
    

    return await this.wholesellersService.resetWholesellerPassword(
      id,
      wholeseller,
      cu,
    );
  }

  //Deleting a wholeseller

  @Delete('/:id')
  async deleteWholeseller(@Param('id') id: string, @AdminUser() user: any) {
    return await this.wholesellersService.deleteWholeseller(id);
  }

  // Adding Multiple Wholesellers At Once

  @Post('/uploadxls')
  async createWholesellersBulk(
    @Body() wholesellers: CreateWholesellerDto[],
    @AdminUser() user: any,
  ) {
    return await this.wholesellersService.updateWholesellersXlsx(wholesellers);
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
}
