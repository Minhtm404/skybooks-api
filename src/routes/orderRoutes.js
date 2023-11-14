const express = require('express');

const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('admin', 'staff'));

router.route('/').get(orderController.query, orderController.getAllOrders);

module.exports = router;
