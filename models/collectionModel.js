const mongoose = require('mongoose');
const slugify = require('slugify');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A collection must have a name']
  },
  slug: { type: String }
});

collectionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
