import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { createOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@UseGuards(AuthGuard())
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/')
  async getAllOrders(@CurrentUser() user: any) {
    if (user.role === 'admin' || user.role === 'employee') {
      return await this.ordersService.getAllOrders();
    } else {
      return await this.ordersService.getAllOrderByUserId(user);
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
    @CurrentUser() user: any,
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
    @CurrentUser() user: any,
  ) {
    // console.log(status);
    return await this.ordersService.updateOrderStatus(id, status, user);
  }
}
