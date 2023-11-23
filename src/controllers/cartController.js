const factory = require('./handlerFactory');
const CartItem = require('../models/cartItemModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllCartItems = factory.getAll(CartItem);

exports.createCartItem = catchAsync(async (req, res, next) => {
  req.body.user = req.params.id ? req.params.id : undefined;

  let existCartItem = await CartItem.findOne({
    user: req.body.user,
    product: req.body.product,
  });

  if (!existCartItem) {
    const newDoc = await CartItem.create(req.body);

    res.status(201).json({
      success: 'success',
      data: newDoc,
    });
  } else {
    existCartItem.quantity = existCartItem.quantity + Number(req.body.quantity);

    await existCartItem.save();

    res.status(201).json({
      success: 'success',
      data: existCartItem,
    });
  }
});

exports.updateCartItem = factory.updateOne(CartItem);

exports.deleteCartItem = factory.deleteOne(CartItem);
