const mongoose = require('mongoose');
const slugify = require('slugify');

const collection = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A collection must have a name']
    },
    slug: { type: String },
    secret: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

productSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });

  next();
});
