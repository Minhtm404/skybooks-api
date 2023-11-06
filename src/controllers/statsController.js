const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getStats = catchAsync(async (req, res, next) => {
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
});
