const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const orderController = require('../controllers//orderController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('admin', 'staff'));

router.route('/').get(orderController.getAllOrders);

module.exports = router;
