const express = require('express');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    productController.createProduct,
  );

router.route('/aliases/:alias').get(productController.getProductByAlias);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    productController.uploadProductImages,
    productController.resizeProductImages,
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    productController.deleteProduct,
  );

module.exports = router;
