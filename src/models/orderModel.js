const mongoose = require('mongoose');

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
});

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'products.product',
    select: 'name price imageCover',
  });

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
