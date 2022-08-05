import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { get } from 'http';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { createOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import ejs from 'ejs';
@UseGuards(AuthGuard())
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/')
  async getAllOrders(@CurrentUser() user: any) {
    console.log('order user Role ===>', user.role);

    if (user.role === 'admin') {
      return await this.ordersService.getAllOrders(user);
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
  // @Get('/:id')
  // async getOrderById(@Param('id') id: string) {
  //   return await this.ordersService.getOrderById(id);
  // }

  @Post('/create')
  async createOrder(@Body() order: createOrderDto) {
    return await this.ordersService.createOrder(order);
  }

  @Get('/testejs')
  async testejs() {
    return ejs.render('index', {
      name: 'John Doe',
    });
  }

  // @Put('/:id')
  // async updateOrder(@Param('id') id: string, @Body() order: any) {
  //   return await this.ordersService.updateOrder(id, order);
  // }

  // @Delete('/:id')
  // async deleteOrder(@Param('id') id: string) {
  //   return await this.ordersService.deleteOrder(id);
  // }
}
