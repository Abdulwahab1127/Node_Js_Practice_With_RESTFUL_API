const express = require('express');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');

// GET /feed/posts - return all posts
exports.getPosts = (req, res) => {

    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;


    Post.find()
    .then(posts =>{
        totalItems = posts.length;
        return Post.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
    })
    .then(posts =>{
        res.status(200).json(
            {   
                message: 'Posts fetched successfully!',
                posts: posts,
                totalItems: totalItems
            }
        );

    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

// POST /feed/post - create a post
exports.createPosts =(req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const err = new Error('Validation Failed/Incorrect Data');
        err.statusCode = 422;
        throw err;
    }
    if(!req.file){
        const err = new Error('No image provided');
        err.statusCode = 422;
        throw err;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\" ,"/");
    // Store post in database

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
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

};

// GET /feed/post/:postId - get a single post
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
};

// PUT /feed/post/:postId - update a post
exports.updatePost = (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){

        const err = new Error('Validation Failed/Incorrect Data');
        err.statusCode = 422;
        throw err;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; // In case image is not updated

    if(req.file){
        imageUrl = req.file.path.replace("\\" ,"/");
    }  
    if(!imageUrl){
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post =>{
            if(!post){
                const error = new Error('Error Finding the Post');
                error.statusCode = 404;
                throw error;
            }
            if(imageUrl !== post.imageUrl){
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();

        })
        .then(result =>{
            res.status(200).json({message: 'Post updated!', post: result});
        })
        .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

};

// DELETE /feed/post/:postId - delete a post
exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    
    Post.findById(postId)
        .then(post =>{

            if(!post){
                const error = new Error('Error Finding the Post');
                error.statusCode = 404;
                throw error;
            }
            // Check logged in user

            // Delete image
            clearImage(post.imageUrl);
            return Post.deleteOne({ _id: postId });

        }).then(result =>{
            console.log(result);
            res.status(200).json({message: 'Post deleted!'});
        })
        .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });


};

// Helper function to delete image from server
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err) );

}
