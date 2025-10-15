const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    

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
exports.login = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    
    let userCredentials;

    User.findOne({email: email})
    .then(user =>{
        if(!user){
            const error = new Error("No User Found Against This Email");
            error.statusCode = 401;
            return next(error); // safer in async flow
        }

        userCredentials = user;
        return bcrypt.compare(password, user.password);

    })
    .then(isEqual=>{
        if(!isEqual){
            const error = new Error("Wrong Password");
            error.statusCode = 401;
            return next(error); // safer in async flow
        }

        const token = jwt.sign
        (   
            { 
                userId: userCredentials._id.toString(),// convert to string to avoid issues
                email: userCredentials.email 
            }, 
        'thisissomesuperdupersecretkey', 
            { 
                expiresIn: '1h' 
            }
        );

        res.status(200).json({token : token, userId: userCredentials._id.toString()});
    })
    
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

