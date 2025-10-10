const express = require('express');
const router = express.Router();

exports.getPosts = (req, res) => {
    res.status(200).json(
        {
            posts: [
                { title: 'First Post', content: 'This is the content of the first post.' },
                { title: 'Second Post', content: 'This is the content of the second post.' }
            ]
        }
    );
}

exports.postPosts =(req,res,next)=>{
    const title = req.body.title;
    const content = req.body.content;
    res.status(201).json({
        message: 'Post created successfully!',
        post: { id: new Date().toISOString(), title: title, content: content }
    });
}