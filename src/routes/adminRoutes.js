const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/login', authController.loginAdmin);

router.use(authController.protect);

router.post('/update-password', authController.updatePassword);

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe, userController.updateUser)
  .delete(userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.queryAdmin, userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
