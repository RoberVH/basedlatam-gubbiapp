
const multer              = require('multer');
const path                = require('path');
const { reconigzeVoice }  = require('../lib/recogVoice')
const morgan              = require ('morgan')

const TEMPORAL_FOLDER = path.join(__dirname, '..', '/uploads') // path returned for _dirname is controllers, bc we want it on proyect folder we upped it with those '..'

// multer conf for tamporal storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMPORAL_FOLDER); // Directorio temporal del servidor
  },
  filename: function (req, file, cb) {
    console.log('nomre', Date.now() + path.extname(file.originalname))
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para el archivo
  }
});

// only accept mp3 files
const fileFilter = (req, file, cb) => {
  const filetypes = /mp3/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = file.mimetype === 'audio/mpeg'

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Solo archivos .mp3 son permitidos'))
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
}).single('audio'); // 'audio' name of file field on form

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

exports.transfer =  (req, res, next) => {
  console.log('transfer hit')

  upload(req, res, async function (err) {
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
      const result = await reconigzeVoice(req.file.path)
      if (result.status)  return  res.status(200).json({
              status: true,
              entities: result.recognizedText
            }) 
          else   return res.status(505).json({
        status: false,
        error: result.error
      });
    });
  }