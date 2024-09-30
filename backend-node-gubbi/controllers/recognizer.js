
const multer      = require('multer');
const path        = require('path');
// const bcrypt      = require("bcrypt");
// const jwt         = require("jsonwebtoken");
// const User        = require("../models/users");
const morgan      = require ('morgan')

const TEMPORAL_FOLDER = '/tmp/'

// multer conf for tamporal storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'TEMPORAL_FOLDER'); // Directorio temporal del servidor
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para el archivo
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'audio/mpeg') {
      return cb(new Error('Solo se permiten archivos MP3'));
    }
    cb(null, true);
  }
}).single('audio'); // 'audio' es el nombre del campo en el formulario

/**
 * transfer - Receive a message commanding transfer of cryptos/tokens/etc from one account to other
 * returns  -
 *        status: true,   enttities: [{entity_name: value}, ...]   (array of properties of form )
 *        status: false, msg: error message
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

exports.transfer = (req, res, next) => {

  try {
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          status: false,
          error: err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          status: false,
          error: 'No se ha subido ningún archivo'
        });
      }

      // El archivo se ha subido correctamente
      return res.status(200).json({
        status: true,
        entities: [{
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        }]
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
};