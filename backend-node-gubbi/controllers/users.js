const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const morgan = require('morgan');
const { ethers } = require('ethers'); // Importar ethers.js una sola vez

// Función para el login de usuario
exports.user_login = (req, res, next) => {
  console.log('req.body', req.body);
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Falló Autorización"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Falló Autorización"
          });
        }
        if (result) {
          console.log('recuperado:', user[0]);
          const token = jwt.sign(
            {
              username: user[0].username,
              userId: user[0]._id,
              publickey: user[0].publickey,
              cellnumber: user[0].cellnumber
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Autorización exitosa",
            token: token,
            username: user[0].username,
            publickey: user[0].publickey,
            privatekey: user[0].privatekey, ////PARA TEST 
            cellnumber: user[0].cellnumber,
          });
        }
        res.status(401).json({
          message: "Falló Autorización"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

// Función para registrar un nuevo usuario
exports.user_signup = async (req, res, next) => {
    try {
        const existingUser = await User.find({ username: req.body.username }).exec();
        if (existingUser.length) {
            return res.status(400).json({ message: 'Usuario ya existe' });
        }

        // Generar la wallet utilizando ethers.js
        const provider = new ethers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
        const wallet = ethers.Wallet.createRandom();
        const connectedWallet = wallet.connect(provider);

        // Encriptar el password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            password: hashedPassword,
            cellnumber: req.body.cellnumber || '',
            publickey: wallet.address,
            privatekey: wallet.privateKey, // En producción, debes encriptar la clave privada antes de guardarla.
        });

        await newUser.save();
        res.status(201).json({ message: 'Usuario creado exitosamente', publickey: wallet.address });
    } catch (err) {
        console.error('Error en user_signup:', err);
        res.status(500).json({ error: err });
    }
};


// OJO. Debido a que la sesion se maneja con un token jsonw web, el servidor no mantiene sesiones abiertas y es el cliente quien deb preservar el token durante la sesion
// a eleccion del programador del cliente puede almacenar el token para enviarlo en cada interaccion con el server y cuando quiera cerrar sesion deberia simplemente
// eliminar el token



