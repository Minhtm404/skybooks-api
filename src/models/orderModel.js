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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'products.product',
    select: 'name',
  });

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
