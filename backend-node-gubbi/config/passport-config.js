'use strict';

const passport = require('passport');
const bd                  =   require('../config/bd-config');

const LocalStrategy       =   require('passport-local').Strategy;


//function passConfig(passport) {
  passport.serializeUser(function(user, cb) {
    //console.log('serializer, user',user)  
    cb(null, user);
    });
    
    passport.deserializeUser(function(id, cb) {
     // console.log('deserializer',id,cb)  
    // User.findById(id, function(err, user) {
     // console.log('Deserializer id', id);
      bd.UserDetails.findById(id, function(err, user) {
        cb(err, user);
      });
    });
  passport.use(new LocalStrategy(function(username, password, done) {
    bd.UserDetails.findOne({
                      username: username 
                    }, function(err, user) {
                      if (err) {
                        return done(err);
                      }
                      if (!user) {
                        return done(null, false,{message:'Credenciales no reconocidas'});
                      }
                      if (user.password != password) {
                        return done(null, false,{message:'Credenciales no reconocidas'});
                      }
		        // la sesion va a ser modificada (obj req.session.passport.user), aqui se puede modificar antes del return
                      return done(null, user);
                      
                    });
                }
    ));
//}  
//module.exports = passConfig;
