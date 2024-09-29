'use strict';

const passport      =   require('passport');


let checar=  function (req,res) {
  console.log('CHECAR')
  let autenticado= req.isAuthenticated().toString();
  //console.log('Autenticado: ', autenticado);
  let sessionId=req.sessionID;
  //console.log('Obj Sesion: ', sessionId);
  console.log('checar: sesion \n ',JSON.stringify(req.session));
  console.log('-'.repeat(90));
  res.status(200).json({msj:`Usuario autenticado: ${autenticado}. Sesion es ${JSON.stringify(req.session)}`})
};

let success= function (req, res){
    console.log('en succes. req:',req.session);
    res.status(200).json({msj:`Usuario ${req.session.passport.user.username}`})
 };

let error = function (req, res) {
    console.log('Error fue invocado');
    res.status(404).json({msj:"Error usuario o contraseña incorrectas"});
};  

let logout =   function  (req, res) {
  req.logout();
  req.session.destroy((err)=>{
        if (err) {
          res.status(404).json(err);
        } else {
          res.status(200).json({msj:'Ok logout'});
        }
  })
};
  

let authorize= function (req, res, next) {
  //console.log('Authorize fue llamado')
    if (!req.isAuthenticated()) {
            res.status(403).json({msj:'Necesita firmarse primero'});
        } else {
            next()
    }
  }      



module.exports = {
    logout,
    authorize,
    checar,
    success,
    error,
};
