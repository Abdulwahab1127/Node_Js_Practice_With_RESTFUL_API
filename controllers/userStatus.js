const express = require('express');
const path = require('path');
const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.getUserStatus = (req, res, next) => {
    User.findById(req.userId).then(user =>{
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({status: user.status});
    }
    ).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};


exports.updateUserStatus = (req, res, next) => {
  const userStatus = req.body.status;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation Failed / Incorrect Data');
    err.statusCode = 422;
    throw err;
  }

  User.findById(req.userId)
    .then(user => {
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      user.status = userStatus;
      return user.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'User Status Updated',
        status: result.status,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

