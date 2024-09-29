const session         =   require('express-session');
const MongoStore      =   require('connect-mongo')(session);
const bd              =   require('../config/bd-config');

function sessionConfig(app,passport) {
    app.use(session({
                secret: process.env.SECRET,
                store: new MongoStore({ mongooseConnection: bd.mongoose.connection}),
                saveUninitialized: true,
                resave: false
              }));

    app.use(passport.initialize());
    app.use(passport.session());
}
module.exports = sessionConfig;
