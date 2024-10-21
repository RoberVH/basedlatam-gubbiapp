const mongoose = require('mongoose');
const File = require('../models/file'); // Modelo de archivo en MongoDB

exports.uploadFile = async (req, res) => {
  try {
    const { userId, url, filename } = req.body;

    // Verifica que los campos requeridos existan
    if (!userId || !url || !filename) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    // Guarda el archivo en la base de datos
    const newFile = new File({
      userId: mongoose.Types.ObjectId(userId), // Convertir el userId a ObjectId
      url: url,
      filename: filename,
    });

    await newFile.save();
    res.status(201).json({ message: 'Archivo subido correctamente', file: newFile });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
