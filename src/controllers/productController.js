const multer = require('multer');
const sharp = require('sharp');

const factory = require('./handlerFactory');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

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

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files?.imageCover || !req.files?.images) {
    return next();
  }

  req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(1333, 2000)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(req.files.images[i].buffer)
        .resize(1333, 2000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${filename}`);

      req.body.images.push(filename);
    }),
  );

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
