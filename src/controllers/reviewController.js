const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.query = catchAsync(async (req, res, next) => {
  req.query.product = req.params.id;

  delete req.params.id;

  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
