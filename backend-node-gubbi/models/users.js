const mongoose    = require('mongoose');


const User = mongoose.Schema({
  _id:        mongoose.Schema.Types.ObjectId,
  username:       { type: String, unique: true },  // Define el campo como único,
  password:       String,
  publickey:      String,
  privatekey:     String,
  cellnumber:     String,
 },
 {timestamps: true}
);

module.exports = mongoose.model('users', User);

 