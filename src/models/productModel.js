const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
      maxlength: [150, 'A product name must have less or equal than 40 characters'],
      minlength: [1, 'A product name must have more or equal than 1 characters'],
    },
    slug: { type: String },
    mainCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    subCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
    },
    discount: {
      type: Number,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    sku: {
      type: String,
    },
    vendor: {
      type: String,
    },
    author: { type: String },
    format: { type: String },
    dimensions: {
      type: String,
    },
    publishDate: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    quantity: {
      type: Number,
      required: [true, 'A product must have a quantity'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  this.priceDiscount = this.price * (1 - (this.discount ? this.discount / 100 : 0));

  next();
});

productSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } })
    .populate({
      path: 'mainCollection',
      select: ' name',
    })
    .populate({
      path: 'subCollection',
      select: 'name',
    });

  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
