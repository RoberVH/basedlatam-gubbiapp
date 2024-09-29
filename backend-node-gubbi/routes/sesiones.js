/* routes/sesiones.js
* RV - Gubbi Server
*                      Rutas directas: servidor:4000/        - retorna mensaje Servidor Ofertika esta escuchando
*                                      servidor:4000/hola    - retorna mensaje ¡hola!
*                                      servidor:4000/compila - compila contratos ethereum en modo test
*/
'use strict';

const express       =   require('express');
const router        =   express.Router();



// rutas para probar que el server este ariba y escuchando
// hacer $curl http://localhost:4000 y 
// $curl http://localhost:4000/hola desde la linea de comandos en el cliente
router.get('/',        (req,res) => res.send('*** Servidor Gubbi está escuchando ***\n'));
router.get('/hola',    (req,res) => res.send('*** ¡hola!, ¿omo estás? ***\n '));



  
module.exports = router;
