import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { createOrderDto } from './dto/create-order.dto';

@UseGuards(AuthGuard())
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/')
  async getAllOrders(@CurrentUser() user: any, @Query() query: any) {
    if (user.role === 'admin' || user.role === 'employee') {
      return await this.ordersService.getAllOrders(
        Number(query.page) || 1,
        Number(query.limit) || 15,
        String(query.search) || ''
      );
    } else {
      return await this.ordersService.getAllOrderByUserId(query, user);
    }
  }

  @Get('/getGraphData')
  async getGraphData(@CurrentUser() user: any, @Query() query: any) {
    if (user.role === 'admin') {
      return await this.ordersService.getGraphData(query);
    } else {
      return await this.ordersService.getGraphDataByUserId(query, user);
    }
  }
  @Get('getOrderByOrderId/:id')
  async getOrderByOrderId(@Param('id') id: string) {
    return await this.ordersService.getOrderByOrderId(id);
  }

  @Post('/create')
  async createOrder(@Body() order: createOrderDto, @CurrentUser() user: any) {
    return await this.ordersService.createOrder(order, user);
  }

  @Put('updateOrderDetails/:id')
  async updateOrder(
    @Param('id') id: string,
    @Body() order: any,
    @CurrentUser() user: any
  ) {
    return await this.ordersService.updateOrder(id, order, user);
  }

  // @Delete('/:id')
  // async deleteOrder(@Param('id') id: string) {
  //   return await this.ordersService.deleteOrder(id);
  // }

  @Put('updateOrderStatus/:id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Query('status') status: any,
    @CurrentUser() user: any
  ) {
    // console.log(status);
    return await this.ordersService.updateOrderStatus(id, status, user);
  }
  // @Post('/uploadInvoice/:id')
  // async uploadInvoice(@UploadedFile() file: Express.Multer.File) {
  //   console.log(file);
  //   return true;
  // }

  @Post('/uploadInvoice/:id')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    console.log(file, body);
  }

  @Delete('/deleteImgae')
  async deleteImage(@Query() query: any) {
    return this.ordersService.deleteInvoiceImage(query?.public_id);
  }

  // @Put('/uploadInvoice/:id')
  // async uploadInvoice(
  //   @Param('id') id: string,
  //   @Body() body: any
  // ) {
  //   // console.log(status);
  //   return await this.ordersService.uploadInvoice(id, body);
  // }
}
