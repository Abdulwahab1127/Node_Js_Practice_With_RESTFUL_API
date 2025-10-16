const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const User = require('../models/user');
const io = require('../socket');


// GET /feed/posts - return all posts
exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    // Get total number of posts
    const totalItems = await Post.find().countDocuments();

    // Get posts for the current page
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// POST /feed/post - create a post
exports.createPosts = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation Failed / Incorrect Data');
      err.statusCode = 422;
      throw err;
    }

    if (!req.file) {
      const err = new Error('No image provided');
      err.statusCode = 422;
      throw err;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\", "/");

    // Create new post instance
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
    });

    // Save post
    const result = await post.save();

    // Find user and add post reference
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    user.posts.push(post);
    await user.save();

    // Emit socket event to notify clients of new post
    const postData = {
      ...post._doc,
      id: post._id.toString(),
      creator: {
        _id: req.userId,
        name: user.name
      }
    };
    io.getIO().emit('posts', { action: 'create', post: postData });



    // Respond with created post

    res.status(201).json({
      message: 'Post created successfully!',
      post: result,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


// GET /feed/post/:postId - get a single post
exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Post fetched.',
      post: post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


// PUT /feed/post/:postId - update a post
exports.updatePost = async (req, res, next) => {
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation Failed / Incorrect Data');
      err.statusCode = 422;
      throw err;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image; // fallback

    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    }

    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Error Finding the Post');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

    // ✅ Keep old image if none provided
    if (!imageUrl) {
      imageUrl = post.imageUrl;
    }

    // If a new image is uploaded, delete the old one
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const result = await post.save();

    const postData = {
      ...result._doc,
      id: result._id.toString(),
      creator: {
        _id: post.creator._id.toString(),
        name: post.creator.name
      }
    };

    io.getIO().emit('posts', { action: 'update', post: postData });

    res.status(200).json({
      message: 'Post updated!',
      post: postData,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};



// DELETE /feed/post/:postId - delete a post
exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Error Finding the Post');
      error.statusCode = 404;
      throw error;
    }

    // Check if logged-in user is the creator
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }

  

    // Delete post from DB
    await Post.deleteOne({ _id: postId });

    // Remove post reference from user
    const user = await User.findById(req.userId);
    if (user) {
      user.posts.pull(postId); // remove postId from posts array
        // Delete image file
      clearImage(post.imageUrl); 
      await user.save();
    }

    io.getIO().emit('posts', { action: 'delete', post: post });

    res.status(200).json({ message: 'Post deleted!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Helper function to delete image from server
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err) );

}
