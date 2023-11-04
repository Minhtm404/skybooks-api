const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');

exports.createReview = factory.createOne(Review);
