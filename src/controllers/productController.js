const multer = require('multer');
const uploadcareStorage = require('multer-storage-uploadcare');

const factory = require('./handlerFactory');
const Collection = require('../models/collectionModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = uploadcareStorage({
  public_key: process.env.UPLOADCARE_PUBLIC_KEY,
  private_key: process.env.UPLOADCARE_SECRET_KEY,
  store: 'auto',
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }

  cb(new AppError('Not an image! Please upload only images.', 400));
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProductImages = upload.single('imageCover');

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.body.imageCover = `${process.env.UPLOADCARE}${req.file.uploadcare_file_id}`;

  next();
});

exports.query = catchAsync(async (req, res, next) => {
  if (req.query.category) {
    req.query = {
      ...req.query,

      mainCollection: {
        $in: await Collection.find({
          slug: { $regex: req.query.category, $options: 'i' },
        }).distinct('_id'),
      },
    };

    delete req.query.category;
  }

  if (req.query.subCategory) {
    req.query = {
      ...req.query,

      subCollection: {
        $in: await Collection.find({
          slug: { $regex: req.query.subCategory, $options: 'i' },
        }).distinct('_id'),
      },
    };

    delete req.query.subCategory;
  }

  if (req.query.keyword) {
    req.query = {
      ...req.query,
      $or: [
        {
          name: { $regex: req.query.keyword, $options: 'i' },
        },
        {
          mainCollection: {
            $in: await Collection.find({
              name: { $regex: req.query.keyword, $options: 'i' },
            }).distinct('_id'),
          },
        },
        {
          sku: { $regex: req.query.keyword, $options: 'i' },
        },
      ],
    };

    delete req.query.keyword;
  }

  next();
});

exports.getAllProducts = factory.getAll(Product);

exports.createProduct = factory.createOne(Product);

exports.getProduct = factory.getOne(Product);

exports.getProductByAlias = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.alias });

  res.status(200).json({
    status: 'success',
    data: product,
  });
});

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError(`No product found with that ID`, 404));
  }

  const countOrder = await await Order.countDocuments({
    products: { $elemMatch: { product: product._id } },
  });

  if (countOrder > 0) {
    return next(new AppError(`Can not delete this product`, 403));
  }

  await product.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
