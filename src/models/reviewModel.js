const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  review: {
    type: String,
    required: [true, 'A review must have a content'],
  },
  rating: {
    type: Number,
    required: [true, 'A review must have a rating'],
  },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
