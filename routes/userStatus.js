const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const userStatusController = require('../controllers/userStatus');
const isAuth = require('../middleware/is-auth');

router.get('/status', isAuth, userStatusController.getUserStatus);
router.put('/status', isAuth, userStatusController.updateUserStatus);

module.exports = router;