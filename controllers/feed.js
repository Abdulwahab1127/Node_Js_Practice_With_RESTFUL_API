const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const post = require('../models/post');

exports.getPosts = (req, res) => {
    Post.find()
    .then(posts =>{
        
        res.status(200).json(
            {   
                message: 'Posts fetched successfully!',
                posts: posts
            }
        );

    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}


exports.createPosts =(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const err = new Error('Validation Failed/Incorrect Data');
        err.statusCode = 422;
        throw err;
    }
    const title = req.body.title;
    const content = req.body.content;
    // Store post in database

    const post = new Post({
        title: title,
        content: content,
        imageUrl: 'images/shirt.png',
        creator: { name: 'Abdul Wahab' }
    })

        post.save()
        .then(result=>{
            res.status(201).json({
                message: "Post created successfully!",
                post: result
            })
        })
        .catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });

}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post =>{
            if(!post){
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Post fetched.', post: post});

        })
        .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}

