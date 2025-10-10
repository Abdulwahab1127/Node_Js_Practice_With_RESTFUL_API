const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');
const e = require('express');

app.use(express.json()); 
app.use(bodyParser.json()); // application/json     

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

app.listen(8080, () => console.log('🚀 Server running on http://localhost:8080'));
