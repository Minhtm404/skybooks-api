const factory = require('./handlerFactory');
const Product = require('../models/productModel');

exports.getAllCollections = factory.getAll(Product);

exports.createCollection = factory.createOne(Product);

exports.getCollection = factory.getOne(Product);

exports.updateCollection = factory.updateOne(Product);

exports.deleteCollection = factory.deleteOne(Product);
