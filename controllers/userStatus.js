const express = require('express');
const path = require('path');
const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};



exports.updateUserStatus = async (req, res, next) => {
  try {
    const userStatus = req.body.status;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation Failed / Incorrect Data');
      err.statusCode = 422;
      throw err;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    user.status = userStatus;
    const result = await user.save();

    res.status(200).json({
      message: 'User Status Updated',
      status: result.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
