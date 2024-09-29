// routes/pagos.js
// RV - Gubbi Server

'use strict';

const express       =   require('express');
const router        =   express.Router();
const pagos         =   require('../controllers/pagos');
const autentica      =   require('../helpers/authorization')

// User Management
router.post('/transferencia',  autentica.authorize,  pagos.transferencia);


// User Management
module.exports = router;  