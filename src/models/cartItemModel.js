const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: [true, 'A cart item must have a quantity'],
  },
});

cartItemSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'product',
    select: 'name price imageCover',
  });

  next();
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
