require('dotenv').config();
const http               =  require('http');
const express            =  require('express');
const app                =  express();
const bodyParser         =  require('body-parser');
const moongose           =  require('mongoose');
const cron               =  require('node-cron');
const users              =  require('./routes/users');
const pagos              =  require('./routes/pagos');
const sesiones           =  require('./routes/sesiones');
const recognize          =  require('./routes/recognize');

console.log('1 inicia Codigo server Backend');
const port = process.env.PORT || 4000;
if (process.env.NODE_ENV === 'production') {
		console.log('¡Estas en ambiente de Producción!');
	} else {
      //  Dev. Definir  morgan logger   
          const  morgan        = require('morgan');
          let options          = {immediate:true};
          app.use(morgan('common',options));
          morgan.token('host', function(req, res) {
            return req.hostname;
          });
          morgan.token('param', function(req, res, param) {
            return req.params[param];
          });
    //app.use((req,res,next) => console.log('LOG: ',req));
 }

//DB connection ********************************
 require('./config/bd-config');
const bd = moongose.connection;
bd.on('error', console.error.bind(console, 'MongoDB/Atlas connection error:'));

//setting http setup  ********************************
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());  

//  Establecer cron job ************************************************ */
//  ejecuta funcion de verificacion y envio de password de concursos diario
//  a las 5 AM tiempo UTC, las 0 o 1 AM tiempo CTD/CTS
//var cronScheduleDailyAt5Oclock=" 0 5 * * *"
let  cronEnviarPassword = " 0 5 * * *";
cron.schedule(cronEnviarPassword, () => { enviarPropuestas } );

// Setting routes ********************************
console.log('2 Instalar rutas');

//const router = express.Router();

app.use('/',sesiones);
app.use('/usuario',users);
app.use('/pagos',pagos);
app.use('/recognize',recognize);

// Last handlers to take care of errors ************************************* */
/*if (process.env.NODE_ENV !== 'production') {          
  const debug= require('./helpers/debugin');
  app.use((error,req,res) => debug.unknownError(error,req,res));
}*/

app.use((req, res, next) => {
  const error = new Error("Ruta no existe en Gubbi Server, verifique URL");
  error.status = 404;
  next(error);
});

// Create & execute http server ********************************
console.log('3 Ejecuta server Gubbi Server');
const server = http.createServer(app);
server.listen(port); //,() => console.log('Servidor Gubbi está escuchando en puerto: ' + port));

  