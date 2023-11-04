const factory = require('./handlerFactory');
const CartItem = require('../models/cartItemModel');

exports.getAllCartItems = factory.getAll(CartItem);
exports.createCartItem = factory.createOne(CartItem);
exports.updateCartItem = factory.updateOne(CartItem);
exports.deleteCartItem = factory.deleteOne(CartItem);
