const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    if (req.params.id) {
      req.query = {
        user: await User.findById(req.params.id).distinct('_id'),
      };
    }

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: docs,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.params.id ? req.params.id : undefined;

    const newDoc = await Model.create(req.body);

    res.status(201).json({
      success: 'success',
      data: newDoc,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    Object.keys(req.body).forEach(key => {
      doc[key] = req.body[key];
    });

    await doc.save();

    doc.password = undefined;

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
