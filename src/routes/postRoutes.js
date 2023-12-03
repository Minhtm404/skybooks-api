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
    postController.uploadProductImages,
    postController.resizeProductImages,
    postController.createPost,
  );

router.route('/aliases/:alias').get(postController.getPostByAlias);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    postController.uploadProductImages,
    postController.resizeProductImages,
    postController.updatePost,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    postController.deletePost,
  );

module.exports = router;
