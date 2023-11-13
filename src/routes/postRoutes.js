const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

const router = express.Router();

router
  .route('/')
  .get(postController.query, postController.getAllPosts)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    userController.getMe,
    postController.createPost,
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    postController.updatePost,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    postController.deletePost,
  );

module.exports = router;
