import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Orders, OrdersDocument } from './orders.schema';
import mongoose, { Model } from 'mongoose';
import { createOrderDto } from './dto/create-order.dto';
import {
  Wholesellers,
  WholesellersDocument,
} from 'src/wholesellers/wholesellers.schema';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Orders.name) private ordersModel: Model<OrdersDocument>,
    @InjectModel(Wholesellers.name)
    private wholesellersModel: Model<WholesellersDocument>,
    private mailsService: MailerService,
  ) {}

    async generateOrderId() {
    // ex- 2101234
    // '21'+'01234'
    // orderId= current fiscal year + the order number starting from zero
    let year: number;
    let id: string;

    // ORDER YEAR
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (currentMonth < 4) year = currentYear - 1;
    else year = currentYear;

    // Order Number
    const date = new Date();
    date.setFullYear(year);
    date.setDate(1);
    date.setMonth(4);
    date.setHours(0, 0, 0, 0);
    // const date = new Date(year, 4, 1);
    const orderCount = await this.ordersModel.countDocuments();
    // {
    //   createdAt: {
    //     $gte: date,
    //   },
    // });

    id = String(orderCount).padStart(5, '0');

    return year.toString().slice(-2) + id;
  }

  async getAllOrders(user: any) {
    return await this.ordersModel.find({
      createdBy: new mongoose.Types.ObjectId(user._id),
    });
  }

  async getAllOrderByUserId(user: any) {
    return await this.ordersModel.find({
      buyers: new mongoose.Types.ObjectId(user._id),
    });
  }

  async sendEmail(reciver: any, htmlData: any) {
    await this.mailsService
      .sendMail({
        to: reciver,
        from: 'Sk.512go@gmail.com',
        subject: 'Order Created',
        text: 'Order Created',
        template: 'emailTemplet',
        context: {
          order: htmlData,
        },
      })
      .then((res) => {
        console.log(res);
      });
  }

  async createOrder(order: createOrderDto) {
    // console.log(order);
    let _order = order;
    let MainTotal = 0;

    const getSum = (item: any) => {
      const sum = item.product.price_wholesale * item.quantity;
      MainTotal += sum;
      return sum;
    };

    _order.products.forEach((item) => {
      getSum(item);
    });

    // let buyersEmailList: any[];

    // await this.wholesellersModel
    //   .find({
    //     _id: { $in: _order.buyers },
    //   })
    //   .then((res) => {
    //     buyersEmailList = res.map((b) => b.email);
    //   });

    // console.log('buyersList ===>', buyersEmailList);

    return await Promise.all(
      _order.buyers.map(async (buyer) => {
        _order.total_cost = MainTotal;
        _order.buyers = buyer;
        
        const newOrder = new this.ordersModel({..._order, orderId: await this.generateOrderId()});
        return newOrder.save();
      }),
    )
      .then(async (order: any) => {
        console.log('order ===>', order);
        await Promise.all(
          order.map(async (odr: any) => {
            await this.wholesellersModel
              .findById(odr.buyers)
              .then(async (res: any) => {
                await this.sendEmail(res.email, odr);
              });
          }),
        );

        return order;
      })
      .catch((err) => {
        console.log(err);
      });

    // return {
    //   ..._order,
    //   total_cost: MainTotal,
    // };

    const createdOrder = new this.ordersModel({
      ..._order,
      total_cost: MainTotal,
    });
    return await createdOrder.save();
  }

  async getGraphData(query: any) {
    // console.log(query);
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (query.startDate === query.endDate) {
      // startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);
    }

    console.log(startDate, endDate);

    // const from = new Date('2022-07-01');
    // const to = new Date('2022-07-29');

    return await this.ordersModel.aggregate([
      {
        $match: {
          // $and: andfilter,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y/%m/%d', date: '$createdAt' } },
          date: { $first: '$createdAt' },
          totalSale: { $sum: '$total_cost' },
          totalOrders: { $sum: 1 },
        },
      },
      {
        // @ts-ignore
        $sort: { _id: 1 },
      },
    ]);
  }

  async getGraphDataByUserId(query: any, user: any) {
    // console.log(query);

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return await this.ordersModel.aggregate([
      {
        $match: {
          buyers: user._id,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y/%m/%d', date: '$createdAt' } },
          totalSale: { $sum: '$total_cost' },

          totalOrders: { $sum: 1 },
        },
      },
      {
        // @ts-ignore
        $sort: { _id: 1 },
      },
    ]);
  }
}
