const factory = require('./handlerFactory');
const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');

exports.query = catchAsync(async (req, res, next) => {
  if (req.query.keyword) {
    req.query = {
      ...req.query,
      title: { $regex: req.query.keyword, $options: 'i' },
    };

    delete req.query.keyword;
  }

  next();
});

exports.getAllPosts = factory.getAll(Post);
exports.createPost = factory.createOne(Post);
exports.getPost = factory.getOne(Post);
exports.updatePost = factory.updateOne(Post);
exports.deletePost = factory.deleteOne(Post);
