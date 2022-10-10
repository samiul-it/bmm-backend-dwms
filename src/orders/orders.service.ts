import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { ActivityLogsService } from 'src/activity-logs/activity-logs.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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
    private activityLogsService: ActivityLogsService,
    private cloudinaryService: CloudinaryService,
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

  async getAllOrders(page: number, limit: number, searchQuery: string) {
    // return await this.ordersModel.find().catch((err) => {
    //   throw new InternalServerErrorException(err);
    // });

    let find = {};

    if (searchQuery) {
      find = { orderId: searchQuery };
    }

    const Orders = await this.ordersModel
      .find(find)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let totalDocuments = await this.ordersModel.find(find).count();

    console.log(searchQuery);

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      curruntPage: page,
      limit: limit,
      totalPages,
      totalDocuments,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      itemList: Orders,
    };

    return result;
  }

  async getAllEmployeeOrders(user: any) {
    return await this.ordersModel.find({
      createdBy: new mongoose.Types.ObjectId(user._id),
    });
  }

  async getAllOrderByUserId(query: any, user: any) {
    // return await this.ordersModel.find({
    //   buyersId: new mongoose.Types.ObjectId(user._id),
    // });

    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 15;
    const user_Id: string = user?._id;
    const searchQuery = query?.search;
    let orders: object[];
    let totalDocuments: any;
    const andfilters = [{ buyersId: new mongoose.Types.ObjectId(user_Id) }];

    if (searchQuery) {
      andfilters.push({
        // @ts-ignore
        $or: [{ orderId: searchQuery }],
      });
    }

    orders = await this.ordersModel
      .aggregate([
        {
          $match: {
            $and: andfilters,
          },
        },
      ])
      .skip((page - 1) * limit)
      .limit(limit)
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });

    if (!orders) throw new NotFoundException('Products not Found');

    const itemCount = await this.ordersModel.aggregate([
      {
        $match: {
          $and: andfilters,
        },
      },
      { $count: 'totalDocuments' },
    ]);

    totalDocuments = itemCount[0]?.totalDocuments;

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      curruntPage: page,
      limit,
      totalPages,
      totalDocuments,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      itemList: orders,
    };

    return result;
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
      status: 'Order Placed',
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
    // console.log('order ==>', order);

    return await Promise.all(
      _order.buyersId.map(async (buyer: any, i) => {
        _order.total_cost = MainTotal;

        // console.log('buyer ==========>', buyer);

        const _orderId = Number(await this.generateOrderId()) + i;
        const admins: any = await this.userService.getAllBackendUsers(null);
        const _buyer = await this.wholesellersModel.findById(buyer);

        const newOrder = await this.ordersModel.create({
          ..._order,
          buyersId: _buyer._id,
          buyersName: _buyer.name,
          buyersEmail: _buyer.email,
          buyersPhone: _buyer.phone,
          buyersAddress: _buyer.address,
          buyersPlace: _buyer.place,
          status: [status],
          orderId: _orderId,
        });

        await this.notificationService
          .pushNotification({
            userId: buyer,
            message: `Your Order Has been Placed, Order ID: #${_orderId}`,
            link: `/OrderDetails/${_orderId}`,
          })
          .then(async (res: any) => {
            await this.notificationServer?.server
              ?.to(res?.socketId)
              .emit('notification', {
                message: `Your Order Has been Placed, Order ID: #${_orderId}`,
                type: 'ORDER',
                data: { category: '' },
              });
          });
        // console.log('admins count ==>', admins?.length);

        await Promise.all(
          admins?.map(async (ad: any) => {
            // console.log('admin ===>', ad);

            await this.notificationService
              .pushNotification({
                userId: ad?._id?.toString(),
                message: `New Order Placed For Wholeseller: ${_buyer?.name} | Order Id: #${_orderId}`,
                link: `/OrderDetails/${_orderId}`,
              })
              .then(async (res: any) => {
                // console.log('admin push notification ===>', {
                //   _id: res?._id,
                //   userId: res?.userId,
                //   messges: res?.messages.pop(),
                //   buyerName: _buyer?.name,
                // });

                await this?.notificationServer?.server
                  ?.to(res?.socketId)
                  ?.emit('notification', {
                    message: `New Order Placed For Wholeseller: ${_buyer?.name} | Order Id: #${_orderId}`,
                    type: 'ADDED',
                    data: { category: '' },
                  });
              });

            return;
          }),
        );

        if (_order?.createdBy === buyer) {
          //? if Created by user himself
          await this.activityLogsService.createActivityLog(
            _order?.createdBy,
            `New Order Created by ${_buyer.name} | Order Id: #${_orderId}`,
          );
        } else {
          //? if Created by employee/admin
          const creator = admins.filter(
            (a: any) => a?._id.toString() === order?.createdBy,
          );
          await this.activityLogsService.createActivityLog(
            _order.createdBy,
            `${creator[0]?.name} Created order for ${_buyer.name} | Order Id: #${_orderId}`,
          );
        }

        return newOrder;
        // return await newOrder.save();
      }),
    )
      .then(async (order: any) => {
        // console.log('order ===>', order);
        await Promise.all(
          order.map(async (odr: any) => {
            await this.wholesellersModel
              .findById(odr.buyersId)
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
    const updatedBy = await this.userService.getUserById(user?._id);
    const admins: any = await this.userService.getAllBackendUsers(null);
    const status = {
      status: query,
      createdAt: new Date(),
      user: user?._id,
      updatedBy: updatedBy?.name,
    };

    const exists = await this.ordersModel.findById(id);

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

        const result = await exists.save().then(async (res) => {
          // console.log('status change res exist ==>', res);

          await this.notificationService
            .pushNotification({
              userId: res?.buyersId,
              message: `#${res?.orderId} Order status updated ${
                res?.status[res.status.length - 1]?.status
              }`,
              link: `/OrderDetails/${res?.orderId}`,
            })
            .then(async (re: any) => {
              await this.notificationServer?.server
                ?.to(re?.socketId)
                .emit('notification', {
                  message: `#${res?.orderId} Order status updated ${
                    res?.status[res?.status.length - 1]?.status
                  }`,
                  type: 'ORDER STATUS UPDATE',
                });
            });

          await Promise.all(
            admins?.map(async (ad: any) => {
              // console.log('admin ===>', ad);

              await this.notificationService
                .pushNotification({
                  userId: ad?._id?.toString(),
                  message: `#${res?.orderId} order status updated by ${
                    updatedBy?.name
                  } To ${res?.status[res.status.length - 1]?.status}`,
                  link: `/OrderDetails/${res?.orderId}`,
                })
                .then(async (re: any) => {
                  // console.log('admin push notification ===>', {
                  //   _id: res?._id,
                  //   userId: res?.userId,
                  //   messges: res?.messages.pop(),
                  //   buyerName: _buyer?.name,
                  // });

                  await this?.notificationServer?.server
                    ?.to(re?.socketId)
                    ?.emit('notification', {
                      message: `#${res?.orderId} order status updated by ${
                        updatedBy?.name
                      } To ${res?.status[res.status.length - 1]?.status}`,
                      type: 'ADDED',
                      data: { category: '' },
                    });
                });

              return;
            }),
          );

          await this.activityLogsService.createActivityLog(
            user?._id,
            `#${res?.orderId} order status updated by ${updatedBy?.name} To ${
              res?.status[res.status.length - 1]?.status
            }`,
          );
        });

        // console.log("If++",result);

        return result;
      } else if (!exists?.status) {
        // const result = await this.ordersModel.findByIdAndUpdate(id, {
        //   ...exists,
        //   status: [status],
        // });

        exists['status'] = [status];

        const result = await exists.save().then(async (res) => {
          // console.log('status change res !exist ==>', res);

          await this.notificationService
            .pushNotification({
              userId: res?.buyersId,
              message: `#${res?.orderId} Order status updated ${
                res?.status[res.status.length - 1]?.status
              }`,
            })
            .then(async (re: any) => {
              await this.notificationServer?.server
                ?.to(re?.socketId)
                .emit('notification', {
                  message: `#${res?.orderId} Order status updated ${
                    res?.status[res?.status.length - 1]?.status
                  }`,
                  type: 'ORDER STATUS UPDATE',
                });
            });

          await Promise.all(
            admins?.map(async (ad: any) => {
              // console.log('admin ===>', ad);

              await this.notificationService
                .pushNotification({
                  userId: ad?._id?.toString(),
                  message: `#${res?.orderId} order status updated by ${
                    updatedBy?.name
                  } To ${res?.status[res.status.length - 1]?.status}`,
                })
                .then(async (res: any) => {
                  // console.log('admin push notification ===>', {
                  //   _id: res?._id,
                  //   userId: res?.userId,
                  //   messges: res?.messages.pop(),
                  //   buyerName: _buyer?.name,
                  // });

                  await this?.notificationServer?.server
                    ?.to(res?.socketId)
                    ?.emit('notification', {
                      message: `#${res?.orderId} order status updated by ${
                        updatedBy?.name
                      } To ${res?.status[res.status.length - 1]?.status}`,
                      type: 'ADDED',
                      data: { category: '' },
                    });
                });

              return;
            }),
          );

          await this.activityLogsService.createActivityLog(
            user?._id,
            `#${res?.orderId} order status updated by ${updatedBy?.name} To ${
              res?.status[res.status.length - 1]?.status
            }`,
          );
        });

        // console.log("Else --",result);

        return result;
      }
    } else {
      throw new NotFoundException('Order  Not Found');
    }
  }

  async getOrderByOrderId(id: string) {
    return await this.ordersModel.findOne({ orderId: id }).catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  async updateOrder(id: string, order: any, user: any) {
    return await this.ordersModel
      .findByIdAndUpdate(id, order)
      .then(async (res) => {
        await this.activityLogsService.createActivityLog(
          user?._id,
          `#${res?.orderId} Order Details Updated by ${user?.name}`,
        );
      })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  // async uploadInvoice(id: string, body: any) {
  //   cloudinary.uploader.upload(
  //     '/home/my_image.jpg',
  //     { upload_preset: 'my_preset' },
  //     (error, result) => {
  //       console.log(result, error);
  //     },
  //   );

  //   // return await this.ordersModel.findOneAndUpdate(
  //   //   { orderId: id },
  //   //   {
  //   //     invoiceURL: body?.invoiceURL,
  //   //   },
  //   // );
  // }

  async deleteInvoiceImage(public_id: string) {
    return this.cloudinaryService.deleteImage(public_id);
  }
}
