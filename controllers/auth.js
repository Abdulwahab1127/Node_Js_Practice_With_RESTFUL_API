const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


exports.signup = (req, res, next) => {debugger
    

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed. Entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error); // safer in async flow
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt.hash(password, 12)
    .then(hashedPw => {
        const user = new User({
            email: email,
            name: name,
            password: hashedPw,
            status: 'active'
        });
        return user.save();
    })
    .then(result => {
        res.status(201).json({ message: 'User created!', userId: result._id });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.login = (req, res, next) => {};

