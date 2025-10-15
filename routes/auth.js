const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');


router.post('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => { // check if email already exists
                    if (userDoc) {
                        return Promise.reject('E-Mail address already exists!'); // if email exists, reject the promise
                    }
                });
            }),
        body('password')
            .isLength({ min: 5 })
            .withMessage('Please enter a password at least 5 characters long.'),
        body('name')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Name is required.')

    ],authController.signup);

router.post('/login',authController.login);


module.exports = router;
