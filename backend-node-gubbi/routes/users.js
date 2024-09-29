// routes/users.js
// RV - Gubbi Server

'use strict';

const express       =   require('express');
const router        =   express.Router();
const users         =   require('../controllers/users');

// User Management
router.post('/signin',  users.user_login);
router.post('/signup', users.user_signup); 

// para logout ver comentario al final de archivo /controllers/users.js

// User Management
module.exports = router;  