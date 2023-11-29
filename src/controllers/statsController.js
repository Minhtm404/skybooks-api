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

    const totalCustomer = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: from, $lte: to },
    });
    const totalProduct = await Product.countDocuments({
      createdAt: { $gte: from, $lte: to },
    });
    const totalOrder = await Order.countDocuments({
      createdAt: { $gte: from, $lte: to },
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalPrice: orderStats?.totalPrice ?? 0,
        totalCustomer,
        totalProduct,
        totalOrder,
      },
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

    const totalCustomer = await User.countDocuments({ role: 'user' });
    const totalProduct = await Product.countDocuments();
    const totalOrder = await Order.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        totalPrice: orderStats.totalPrice,
        totalCustomer,
        totalProduct,
        totalOrder,
      },
    });
  }
});
