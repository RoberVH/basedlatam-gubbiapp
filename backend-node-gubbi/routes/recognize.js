// routes/recognize.js
// RV - Gubbi Server

'use strict';

const express       =   require('express');
const router        =   express.Router();
const recognizer    =   require('../controllers/recognizer');
const autentica     =   require('../helpers/authorization')

// User Management
//router.post('/transfer',  autentica.authorize,  recognizer.transfer);
router.post('/transfer',  recognizer.transfer);


// User Management
module.exports = router;  