'use strict';
const bd        =   require ('../config/bd-config');

let adduser= async function (req, res) {
    if (!datos_completos(req.body)) {
        return res.status(400).json({msj:'No hay suficientes datos, verificar'})}
     else {        
      await bd.UserDetails.findOne({username: req.body.username},async (err,user)=> {
        if (err) {
              return res.status(500).json(err)
            } else {
              if (user) {
                return res.status(409).json({msj: `Usuario: ${req.body.username} ya existe`});
              }
              else {
                await bd.UserDetails
                 .create({username: req.body.username, 
                          password:  req.body.password,
                          publickey: req.body.publickey}, (err, user) => {
                            if (err) {
                              return res.status(400).json(err);
                              } else {
                              return res.status(200).json({msj: 'Usuario creado exitosamente'});
                            }
                          }) 
              }
        } 
      });
    }
  };


    function datos_completos(params) {
   // console.log('params',params);
   // console.log('params',params.username, params.password);
   // console.log('params',params.publickey);
    let dcOk=(!params.username.trim().length == 0 && !params.password.trim().length == 0 && !params.publickey.trim().length == 0);
    return dcOk;
   }

   module.exports= {
    adduser
   }
