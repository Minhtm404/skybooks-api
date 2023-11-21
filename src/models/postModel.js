const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'A post must have a content'],
  },
  slug: { type: String },
  content: {
    type: String,
    required: [true, 'A post must have a content'],
  },
});

postSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: ' name',
  });

  next();
});

const Post = mongoose.model('post', postSchema);

module.exports = Post;
