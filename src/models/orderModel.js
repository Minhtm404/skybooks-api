const mongoose = require('mongoose');

const CartItem = require('../models/cartItemModel');

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Order must have a product'],
      },
      quantity: {
        type: Number,
        required: [true, 'Please tell us quantity of product'],
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  price: {
    type: Number,
    require: [true, 'Order must have a price.'],
  },
  name: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
  orderStatus: {
    type: String,
    enum: ['new', 'delivery', 'complete'],
    default: 'new',
  },
  idString: {
    type: String,
    unique: true,
  },
});

orderSchema.statics.clearCartItem = async function (userId) {
  await CartItem.deleteMany({ user: userId });
};

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'products.product',
    select: 'name price imageCover',
  });

  next();
});

orderSchema.pre('save', function (next) {
  // Generate idString from the ObjectId
  this.idString = this._id.toHexString();
  next();
});

orderSchema.post('save', function (doc) {
  this.constructor.clearCartItem(this.user);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
