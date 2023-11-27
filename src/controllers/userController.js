const factory = require('./handlerFactory');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.query = catchAsync(async (req, res, next) => {
  req.query.role = ['user'];

  if (req.query.keyword) {
    req.query = {
      ...req.query,
      $or: [
        {
          name: { $regex: req.query.keyword, $options: 'i' },
        },
        {
          email: { $regex: req.query.keyword, $options: 'i' },
        },
        {
          phoneNumber: { $regex: req.query.keyword, $options: 'i' },
        },
      ],
    };

    delete req.query.keyword;
  }

  next();
});

exports.queryAdmin = catchAsync(async (req, res, next) => {
  if (
    !req.query.role ||
    (req.query.role && !req.query.role === 'admin' && !req.query.role === 'staff')
  ) {
    req.query.role = ['admin', 'staff'];
  }

  if (req.query.keyword) {
    req.query = {
      ...req.query,
      $or: [
        {
          name: { $regex: req.query.keyword, $options: 'i' },
        },
        {
          email: { $regex: req.query.keyword, $options: 'i' },
        },
        {
          role: { $regex: req.query.keyword, $options: 'i' },
        },
      ],
    };

    delete req.query.keyword;
  }

  next();
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400,
      ),
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email', 'phoneNumber', 'address');

  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role, status } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
    status,
  });

  res.status(201).json({
    success: 'success',
    data: newUser,
  });
});

exports.getUser = factory.getOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phoneNumber',
    'address',
    'role',
    'status',
  );

  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteUser = factory.deleteOne(User);
