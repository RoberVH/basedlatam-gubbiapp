const jwt               = require('jsonwebtoken');
//const {esAgencia}       = require('../data/empresas');

exports.authorize = (req, res, next) => {
    try {
    //console.log('en Autz. Req.headers es:',req.headers);
	//console.log('en Autz. Req.body es:',req.body);
  
    //  console.log('Objeto Headers: ',req.headers);
    //  console.log('Objeto rawHeaders: ',req.rawHeaders);
console.log('-'.repeat(90));
        //const token = req.headers.token.split(" ")[1];
	const token = req.headers.authorization.split(" ")[1];
        //console.log('en Autz:',token);
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
	console.log('Datos decodificados: ', req.userData);
        next();
    } catch (error) {
         res.status(401).json({
        //return res.status(401).json({
            message: "Falló Autorización, revise credenciales"
        });
    }
}
