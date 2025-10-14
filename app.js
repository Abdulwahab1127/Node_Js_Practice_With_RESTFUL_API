const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const e = require('express');

app.use(express.json());
app.use(bodyParser.json()); // application/json     
app.use('/images', express.static(path.join(__dirname, 'images'))); // to serve images statically


// MULTER SETUP 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});

// File filter for multer to accept only certain file types
const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
      ){
        cb(null, true);
    }else{
        cb(null, false);
    }

}

app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image')); // for handling multipart/form-data

// CORS HEADERS SETUP 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

app.get('/', (req, res) => {
  res.send('Hello from RESTful API Practice!');
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
})

mongoose
  .connect(process.env.MONGODB_URI)
  .then(result =>{
    app.listen(8080, () => console.log('🚀 Server running on http://localhost:8080')) ;
  })
  .catch(err => {
    console.log(err);
  });
