'use strict';
//const mongoose  =   require("mongoose");
const Usuarios  =   require('../models/users');

exports.obtenEmailsUsuariosAgencia= (idAgencia) => {
  return new Promise((resolve, reject) => {
   Usuarios.find({ icellnumber: idAgencia })
    .exec()
    .then(usuarios => {
        if (usuarios.length < 1) {
            reject ({message: `No hay usuarios con clave: ${idAgencia}`});
            return;
            };
        resolve(usuarios);
        })
    })
}
