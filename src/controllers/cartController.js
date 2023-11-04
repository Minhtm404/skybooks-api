const factory = require('./handlerFactory');
const CartItem = require('../models/cartItemModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllCartItems = factory.getAll(CartItem);
exports.createCartItem = factory.createOne(CartItem);
exports.updateCartItem = factory.updateOne(CartItem);
exports.deleteCartItem = factory.deleteOne(CartItem);
