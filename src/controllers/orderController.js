const factory = require('./handlerFactory');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.query = catchAsync(async (req, res, next) => {
  if (req.query.keyword) {
    req.query = {
      ...req.query,
      $or: [
        {
          user: {
            $in: await User.find({
              name: { $regex: req.query.keyword, $options: 'i' },
            }).distinct('_id'),
          },
        },
        {
          'products.product': {
            $in: await Product.find({
              name: { $regex: req.query.keyword, $options: 'i' },
            }).distinct('_id'),
          },
        },
      ],
    };

    delete req.query.keyword;
  }

  next();
});

exports.getAllOrders = factory.getAll(Order);
exports.createOrder = factory.createOne(Order);
exports.getOrder = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
