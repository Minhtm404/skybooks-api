const factory = require('./handlerFactory');
const Collection = require('../models/collectionModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

exports.query = catchAsync(async (req, res, next) => {
  if (req.query.keyword) {
    req.query = {
      ...req.query,
      $or: [
        {
          name: { $regex: req.query.keyword, $options: 'i' },
        },
        {
          parentCollection: {
            $in: await Collection.find({
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

exports.getAllCollections = factory.getAll(Collection);

exports.createCollection = factory.createOne(Collection);

exports.getCollection = factory.getOne(Collection);

exports.updateCollection = factory.updateOne(Collection);

exports.deleteCollection = catchAsync(async (req, res, next) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    return next(new AppError(`No collection found with that ID`, 404));
  }

  const countChild = await Collection.countDocuments({
    parentCollection: collection._id,
  });

  if (countChild > 0) {
    return next(new AppError(`Can not delete this collection`, 403));
  }

  const countProduct = await Product.countDocuments({
    $or: [{ mainCollection: collection._id }, { subCollection: collection._id }],
  });

  if (countProduct > 0) {
    return next(new AppError(`Can not delete this collection`, 403));
  }

  await collection.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
