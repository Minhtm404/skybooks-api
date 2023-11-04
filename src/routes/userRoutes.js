const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.use(authController.protect);

router.post('/update-password', authController.updatePassword);

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe, userController.updateUser)
  .delete(userController.deleteMe, userController.deleteUser);

router
  .route('/cart')
  .get(userController.getMe, cartController.getAllCartItems)
  .post(userController.getMe, cartController.createCartItem);

router
  .route('/cart/:id')
  .patch(cartController.updateCartItem)
  .delete(cartController.deleteCartItem);

router.use(authController.restrictTo('admin', 'staff'));

router.route('/').get(userController.query, userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
