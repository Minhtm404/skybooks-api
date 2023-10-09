const mongoose = require('mongoose');
const slugify = require('slugify');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A collection must have a name'],
  },
  mainCollection: {
    type: Boolean,
    default: false,
  },
  parentCollection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  },
  slug: { type: String },
});

collectionSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
