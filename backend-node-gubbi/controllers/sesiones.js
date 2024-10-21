'use strict';

const authorize      =   require('../helpers/authorization');


let checar=  function (req,res) {
  console.log('-'.repeat(90));
  console.log('Objeto req: ',req);

  res.status(200).json({msj:`Usuario autenticado: ${req.userData.username}.`});
};

let success= function (req, res){
    console.log('en succes. req:',req.session);
    res.status(200).json({msj:`Usuario ${req.session.passport.user.username}`})
 };

let error = function (req, res) {
    console.log('Error fue invocado');
    res.status(404).json({msj:"Error usuario o contraseña incorrectas"});
};  

    


module.exports = {
    checar,
    success,
    error
};
