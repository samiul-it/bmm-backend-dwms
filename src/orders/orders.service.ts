import { Injectable, NotFoundException } from '@nestjs/common';
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
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { UserService } from 'src/user/user.service';
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Orders.name) private ordersModel: Model<OrdersDocument>,
    @InjectModel(Wholesellers.name)
    private wholesellersModel: Model<WholesellersDocument>,
    private mailsService: MailerService,
    private notificationService: NotificationService,
    private notificationServer: NotificationGateway,
    private userService: UserService,
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
    const orderCount = await this.ordersModel
      .find({
        createdAt: {
          $gte: date,
        },
      })
      .count();

    id = String(orderCount).padStart(6, '0');
    // console.log('return afwa ===>', year.toString().slice(-2), id);
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
        from: 'rp73006@gmail.com',
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

  async createOrder(order: createOrderDto, user: any) {
    // console.log(order);
    const status = {
      status: ' Order Placed',
      createdAt: new Date(),
      user: user?._id,
    };

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

    return await Promise.all(
      _order.buyers.map(async (buyer: any, i) => {
        _order.total_cost = MainTotal;
        _order.buyers = buyer;
        console.log('buyer ==========>', buyer);
        const _orderId = Number(await this.generateOrderId()) + i;

        const newOrder = await this.ordersModel.create({
          ..._order,
          status: [status],
          orderId: _orderId,
        });

        const admins: any = await this.userService.getAllBackendUsers(null);
        const _buyer = await this.wholesellersModel.findById(buyer);

        this.notificationService
          .pushNotification({
            userId: buyer,
            message: `Your Order Has been Placed, Order ID: #${_orderId}`,
          })
          .then((res: any) => {
            this.notificationServer?.server
              ?.to(res?.socketId)
              .emit('notification', {
                message: `Your Order Has been Placed, Order ID: #${_orderId}`,
                type: 'ORDER',
                data: { category: '' },
              });
          });

        await Promise.all(
          admins?.map(async (ad: any) => {
            await this.notificationService
              .pushNotification({
                userId: ad._id.toString(),
                message: `New Order Placed For Wholeseller: ${_buyer.name}`,
              })
              .then((res: any) => {
                this.notificationServer.server
                  ?.to(res?.socketId)
                  ?.emit('notification', {
                    message: `New Order Placed For Wholeseller: ${_buyer.name}`,
                    type: 'ADDED',
                    data: { category: '' },
                  });
              });

            return;
          }),
        );

        return newOrder;
        // return await newOrder.save();
      }),
    )
      .then(async (order: any) => {
        // console.log('order ===>', order);
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
  }

  async getGraphData(query: any) {
    // console.log(query);
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (query.startDate === query.endDate) {
      // startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);
    }

    // console.log(startDate, endDate);

    // const from = new Date('2022-07-01');
    // const to = new Date('2022-07-29');

    const data = await this.ordersModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $project: {
          dateParts: {
            // This will split the date stored in `dateField` into parts
            $dateToParts: {
              date: '$createdAt',
              // This can be an Olson timezone, such as Europe/London, or
              // a fixed offset, such as +0530 for India.
              timezone: '+05:30',
            },
          },
          total: { $sum: '$total_cost' },
        },
      },
      {
        $group: {
          // @ts-ignore
          // _id: { $dateToString: { format: '%Y/%m/%d', date: '$createdAt'} },
          _id: {
            year: '$dateParts.year',
            month: '$dateParts.month',
            day: '$dateParts.day',
          },
          date: { $first: '$dateParts' },
          totalSale: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);

    return await Promise.all(
      data.map((d) => {
        d._id = d._id.year + '-' + d._id.month + '-' + d._id.day;
        return d;
      }),
    );
  }

  async getGraphDataByUserId(query: any, user: any) {
    // console.log(query);

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if (query.startDate === query.endDate) {
      // startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);
    }

    const data = await this.ordersModel.aggregate([
      {
        $match: {
          buyers: user._id,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          dateParts: {
            // This will split the date stored in `dateField` into parts
            $dateToParts: {
              date: '$createdAt',
              // This can be an Olson timezone, such as Europe/London, or
              // a fixed offset, such as +0530 for India.
              timezone: '+05:30',
            },
          },
          total: { $sum: '$total_cost' },
        },
      },
      {
        $group: {
          // @ts-ignore
          // _id: { $dateToString: { format: '%Y/%m/%d', date: '$createdAt'} },
          _id: {
            year: '$dateParts.year',
            month: '$dateParts.month',
            day: '$dateParts.day',
          },
          date: { $first: '$dateParts' },
          totalSale: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);

    return await Promise.all(
      data.map((d) => {
        d._id = d._id.year + '-' + d._id.month + '-' + d._id.day;
        return d;
      }),
    );
  }

  async updateOrderStatus(id: any, query: any, user: any) {
    const status = {
      status: query,
      createdAt: new Date(),
      user: user?._id,
    };

    const exists = await this.ordersModel.findById(id);
    console.log(status);

    if (exists) {
      if (
        exists?.status &&
        exists.status[exists.status?.length - 1]?.status !== status.status
      ) {
        // const result = await this.ordersModel.findByIdAndUpdate(id, {
        //   ...exists,
        //   status: [...exists.status, status],
        // });

        exists?.status.push(status);

        const result = await exists.save();

        // console.log("If++",result);

        return result;
      } else if (!exists?.status) {
        // const result = await this.ordersModel.findByIdAndUpdate(id, {
        //   ...exists,
        //   status: [status],
        // });

        exists['status'] = [status];

        const result = await exists.save();

        // console.log("Else --",result);

        return result;
      }
    } else {
      throw new NotFoundException('Order  Not Found');
    }
  }
}
