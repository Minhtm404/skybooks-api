const factory = require('./handlerFactory');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

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
