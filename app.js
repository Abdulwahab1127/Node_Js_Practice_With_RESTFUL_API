const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const feedRoutes = require('./routes/feed');
const e = require('express');

app.use(express.json()); 
app.use(bodyParser.json()); // application/json     
app.use('/images', express.static(path.join(__dirname, 'images')));

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
