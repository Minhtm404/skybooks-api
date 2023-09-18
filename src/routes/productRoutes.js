const express = require('express');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');

const router = express.Router();

router
  .route('/')
  .get(productController.getAllCollections)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    productController.createCollection
  );

router
  .route('/:id')
  .get(productController.getCollection)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    productController.updateCollection
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    productController.deleteCollection
  );

module.exports = router;
