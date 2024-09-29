'use strict';

const dbconn      = require('./dbconnstr');
const mongoose    = require('mongoose');


//mongoose.connect(dbconn,{ useNewUrlParser: true });
mongoose.connect(dbconn);
