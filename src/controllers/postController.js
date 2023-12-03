const multer = require('multer');
const uploadcareStorage = require('multer-storage-uploadcare');

const factory = require('./handlerFactory');
const Post = require('../models/postModel');
const User = require('../models/userModel');
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
  if (req.query.keyword) {
    req.query = {
      ...req.query,
      $or: [
        {
          user: {
            $in: await User.find({
              name: { $regex: req.query.keyword, $options: 'i' },
            }).distinct('_id'),
          },
        },
        {
          title: { $regex: req.query.keyword, $options: 'i' },
        },
      ],
    };

    delete req.query.keyword;
  }

  next();
});

exports.getAllPosts = factory.getAll(Post);

exports.createPost = factory.createOne(Post);

exports.getPost = factory.getOne(Post);

exports.getPostByAlias = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({ slug: req.params.alias });

  res.status(200).json({
    status: 'success',
    data: post,
  });
});

exports.updatePost = factory.updateOne(Post);

exports.deletePost = factory.deleteOne(Post);
