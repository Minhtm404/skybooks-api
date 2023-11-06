const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const statsController = require('../controllers/statsController');

const router = express.Router();

router.use(authController.protect, authController.restrictTo('admin', 'staff'));

router.route('/').get(statsController.getStats);

module.exports = router;
