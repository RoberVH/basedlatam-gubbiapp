const mongoose    = require("mongoose");
const bcrypt      = require("bcrypt");
const jwt         = require("jsonwebtoken");
const User        = require("../models/users");
const morgan      = require ('morgan')
const autentica     =   require('../helpers/authorization');


/************
 * AQUI EN METODO TRANSFERENCIA HAY QUE VALIDAR SALDO AL MENOS cant DE CTA source Y HACER EL TRASPASO ENTRE CUENTAS DE LOS TOKENS
 * REPORTAR EXITO O FALLO INDICANDO CAUSA
 * 
 */
exports.transferencia =  (req, res, next) => {
  console.log('PAGOS')
  console.log('Correctamente accedido los parametros recibidos son', req.body)
  const user = req.body
  return res.status(200).json({
    message: "Transferencia exitosa",
    username: user.username,
    source: user.source,
    dest: user.dest,
  });
  
}

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
          /**
           * aqui el codigo para hacer la transferencia de tokens
           * conectarse a las blockchains adecuadas o entre los tokens ERC-20
           * crear TX y firmarla con la clave privada del usuario y enviarla - si exito actualizar los saldos y estadisticas en la BD
           * Aqui podria ser que el efectivo salga de una cuenta maestra o tesoreria de Gubbi y rapiadmente dar servicio al usuario mientras que se encola la 
           * liquidacion de los tokens del usuario, que puede ser un proceso mas larga. Esto podría manejarse con un servicio de funciones serveless y/o un
           * servicio de manejo de mensajes como Kafka o rabbit
           * 
           */
          // por ahora solo regresamos un mensaje de exito y algunos datos
          return res.status(200).json({
            message: "Autorización exitosa",
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
              //***************************************** 
              // AQUI crear y asignar las llaves publico privadas para administrar la cuenta del usuario!
              let publickey = '0x275992a10C582473f45d0D966564b757d8B66750'    // provisional
              let privatekey = '5e1278c564f54091bddcfa8cc4063609c7b9c34b8aa3f9d1e50ef2a0c3b41202'    // provisional
              //********************************************
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



