const mongoose    = require("mongoose");
const bcrypt      = require("bcrypt");
const jwt         = require("jsonwebtoken");
const User        = require("../models/users");
const morgan      = require ('morgan')


exports.user_login = (req, res, next) => {
  //morgan(':method :host :status :res[content-length] - :response-time ms'); // This is a modified version of morgan's tiny predefined format string.
  console.log('req.body', req.body)
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Falló Authorización"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Falló Authorización"
          });
        }
        if (result) {
          console.log('recuperado:',user[0]);
          const token = jwt.sign(
            {
              username: user[0].username,
              userId: user[0]._id,
              publickey: user[0].publickey,
              cellnumber: user[0].cellnumber
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Autorización exitosa",
            token: token,
            username: user[0].username,
            publickey: user[0].publickey,
            cellnumber: user[0].cellnumber,

          });
        }
        res.status(401).json({
          message: "Falló Authorización"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

// SignUp un nuevo usuario
exports.user_signup = (req, res, next) => {
     // Checar si el nombre de usuario ya esta tomado y rechaza si es asi
     console.log('req.body', req.body)
     User.find({username: req.body.username})
    .exec()
    .then(user => {
        if (user.length!=0) {
          console.warn('Usuario ya existe');
          res.status(500).json({message: 'Usuario ya existe'})
        } else {
          // user nuevo, intentar el alta del usuario 
          // encripta el password
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                console.log('error en hashing', err)
                res.status(500).json({
                error: err
              });
            } else {   
              // OK crear usuario
              let cellnumber=  req.body.cellnumber ?? ''  // cellnumber opcional, previene si no existe
              const user = new User({
                  _id:        new mongoose.Types.ObjectId(),
                  username:      req.body.username,
                  cellnumber:    cellnumber,
                  password:      hash,    // salva el hash para validar password en cada login
                  publickey:     publickey,    
                  privatekey:     privatekey,    
                });
                user.save()
                  .then(result => {
                    console.log('resultado:',result);
                    res.status(201).json({
                      message: "Usuario creado exitosamente"
                    });
                  })
                  .catch(err => {
                    console.log(err);
                    res.status(500).json({
                    message: err
                    });
                  });
                  }
          })
        }
      }).catch ((error) =>{
          console.warn(error);
          res.status(500).json({message: error}); 
          return;
      })

};

// OJO. Debido a que la sesion se maneja con un token jsonw web, el servidor no mantiene sesiones abiertas y es el cliente quien deb preservar el token durante la sesion
// a eleccion del programador del cliente puede almacenar el token para enviarlo en cada interaccion con el server y cuando quiera cerrar sesion deberia simplemente
// eliminar el token



