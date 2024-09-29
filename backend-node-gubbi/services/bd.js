// const mongoose       =      require('mongoose');



// let cnxMongoose=    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-iyho2.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
// console.log('Por conectar Mongoose con cadena:',cnxMongoose);

// mongoose.connect(cnxMongoose,{ useNewUrlParser: true });
// mongoose.set('useFindAndModify', false);
// //console.log('Mongoose conectado');
// const Schema = mongoose.Schema;
// const UserDetail = new Schema({
//       username: String,
//       password: String,
//       publickey: String,
//     });

//     const UserDetails = mongoose.model('userInfo', UserDetail,  'userInfo');
// // prueba de conexion a mongoDB
// UserDetails.findOne({username: 'admin'}, 
//           function(err, user) {
//               if (err) {
//                 return done(err);
//               }
//               if (!user) {
//                 return done(null, false);
//               }
//               console.log('Usuario recuperado: ', user);
//             });


// module.exports = {
//     mongoose,
//     UserDetails,
// };