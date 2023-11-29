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

  const orderStats = await Order.aggregate([
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

  const collectionStats = await Order.aggregate([
    {
      $unwind: '$products', // Deconstructs the products array to work with individual products
    },
    {
      $lookup: {
        from: 'products', // Assuming the collection name is 'products'
        localField: 'products.product',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails', // Deconstructs the productDetails array
    },
    {
      $lookup: {
        from: 'collections', // Assuming the collection name is 'collections'
        localField: 'productDetails.mainCollection', // Assuming 'mainCollection' is the field referencing the collection
        foreignField: '_id',
        as: 'collectionDetails',
      },
    },
    {
      $unwind: '$collectionDetails', // Deconstructs the collectionDetails array
    },
    {
      $group: {
        _id: '$collectionDetails._id', // Grouping by collection ID
        collectionName: { $first: '$collectionDetails.name' }, // Collecting the first occurrence of the collection name
        count: { $sum: 1 }, // Counting occurrences of products in each collection
      },
    },
  ]);

  const topPerformers = await Order.aggregate([
    {
      $unwind: '$products', // Deconstructs the products array
    },
    {
      $group: {
        _id: '$products.product', // Grouping by product ID
        productName: { $first: '$products.name' }, // Collecting the product name
        totalSold: { $sum: '$products.quantity' }, // Calculating the total quantity sold for each product
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: '$productDetails',
    },
    {
      $addFields: {
        productName: '$productDetails.name', // Update productName using productDetails
        productImage: '$productDetails.imageCover', // Adding productImage field from imageCover in productDetails
      },
    },
    {
      $lookup: {
        from: 'collections',
        localField: 'productDetails.mainCollection',
        foreignField: '_id',
        as: 'collectionDetails',
      },
    },
    {
      $unwind: '$collectionDetails',
    },
    {
      $addFields: {
        productCollectionName: '$collectionDetails.name', // Adding productCollectionName field from name in collectionDetails
      },
    },
    {
      $project: {
        _id: 1, // Keep the product ID
        productName: 1, // Keep the product name
        productImage: 1, // Keep the product image
        productCollectionName: 1, // Keep the product collection name
        totalSold: 1, // Keep the total quantity sold
      },
    },
    {
      $sort: { totalSold: -1 }, // Sorting by totalSold in descending order
    },
    {
      $limit: 5, // Limiting to the top 5 best-selling products
    },
  ]);

  const lowPerformers = await Product.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'products.product',
        as: 'orderDetails',
      },
    },
    {
      $addFields: {
        totalSold: {
          $cond: {
            if: { $isArray: '$orderDetails' },
            then: { $size: '$orderDetails' },
            else: 0,
          },
        },
      },
    },
    {
      $match: {
        totalSold: { $gte: 0, $lt: 5 }, // Filter for products sold more than 0 and less than 5 times
      },
    },
    {
      $sort: { totalSold: 1 }, // Sorting by totalSold in ascending order (least sold)
    },
    {
      $limit: 5, // Limiting to the top 5 least-selling products
    },
    {
      $lookup: {
        from: 'collections',
        localField: 'mainCollection', // Assuming 'mainCollection' is the field referencing the collection
        foreignField: '_id',
        as: 'collectionDetails',
      },
    },
    {
      $unwind: { path: '$collectionDetails', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        totalSold: 1,
        productCollectionName: '$collectionDetails.name', // Adding productCollectionName field from name in collectionDetails
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        totalSold: 1,
        productCollectionName: 1, // Keep the product collection name
        productImage: '$productDetails.imageCover', // Adding productImage field from imageCover in productDetails
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalPrice,
      totalCustomer,
      totalProduct,
      totalOrder,
      orderStats,
      collectionStats,
      topPerformers,
      lowPerformers,
    },
  });
});
