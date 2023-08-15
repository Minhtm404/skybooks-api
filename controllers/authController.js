const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  user.password = undefined;
  user.active = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm });

  createSendToken(newUser, 201, req, res);
};

exports.login = async (req, res) => {
  res.status(200).json({ status: 'success' });
};

exports.logout = async (req, res) => {
  res.status(200).json({ status: 'success' });
};

exports.forgotPassword = async (req, res) => {
  res.status(200).json({ status: 'success' });
};

exports.resetPassword = async (req, res) => {
  res.status(200).json({ status: 'success' });
};
