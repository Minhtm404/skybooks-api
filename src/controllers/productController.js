const multer = require('multer');
const uploadcareStorage = require('multer-storage-uploadcare');

const factory = require('./handlerFactory');
const Product = require('../models/productModel');
const Collection = require('../models/collectionModel');
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
  console.log(req.file);
  console.log(req.files);
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

exports.deleteProduct = factory.deleteOne(Product);
