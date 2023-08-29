const express = require('express');

const authController = require('../controllers/authController');
const collectionController = require('../controllers/collectionController');

const router = express.Router();

router
  .route('/')
  .get(collectionController.getAllCollections)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    collectionController.createCollection
  );

router
  .route('/:id')
  .get(collectionController.getCollection)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    collectionController.updateCollection
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'staff'),
    collectionController.deleteCollection
  );

module.exports = router;
