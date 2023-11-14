const factory = require('./handlerFactory');
const Collection = require('../models/collectionModel');
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

exports.deleteCollection = factory.deleteOne(Collection);
