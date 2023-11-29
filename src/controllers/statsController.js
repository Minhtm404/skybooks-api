const moment = require('moment');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const calculateFromTo = key => {
  if (key === 'today') {
    return {
      from: moment().startOf('day').utc().toDate(),
      to: moment().endOf('day').utc().toDate(),
    };
  } else if (key === 'last-7-days') {
    return {
      from: moment().subtract(7, 'days').startOf('day').utc().toDate(),
      to: moment().endOf('day').utc().toDate(),
    };
  } else if (key === 'last-month') {
    return {
      from: moment().subtract(1, 'month').startOf('day').utc().toDate(),
      to: moment().endOf('day').utc().toDate(),
    };
  }
};

exports.getStats = catchAsync(async (req, res, next) => {
  let totalPrice;
  let totalCustomer;
  let totalProduct;
  let totalOrder;

  if (req.query.range) {
    const { from, to } = calculateFromTo(req.query.range);

    const [orderStats] = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: '$price' },
        },
      },
    ]);

    totalPrice = orderStats?.totalPrice ?? 0;
    totalCustomer = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: from, $lte: to },
    });
    totalProduct = await Product.countDocuments({
      createdAt: { $gte: from, $lte: to },
    });
    totalOrder = await Order.countDocuments({
      createdAt: { $gte: from, $lte: to },
    });
  } else {
    const [orderStats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalPrice: { $sum: '$price' },
        },
      },
    ]);

    totalPrice = orderStats?.totalPrice ?? 0;
    totalCustomer = await User.countDocuments({ role: 'user' });
    totalProduct = await Product.countDocuments();
    totalOrder = await Order.countDocuments();
  }

  const lastSixMonths = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: moment().startOf('month').subtract(5, 'months').utc().toDate(),
        }, // Filter for the last 6 months
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$createdAt' }, // Grouping by year-month
        },
        totalAmount: { $sum: '$price' }, // Calculating total price for each month
        totalOrders: { $sum: 1 }, // Counting the number of orders for each month
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        totalAmount: 1,
        totalOrders: 1,
      },
    },
    {
      $sort: { month: 1 }, // Optionally sorting by month
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalPrice,
      totalCustomer,
      totalProduct,
      totalOrder,
      lastSixMonths,
    },
  });
});
