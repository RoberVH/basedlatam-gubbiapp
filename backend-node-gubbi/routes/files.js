const express = require('express');
const router = express.Router();
const File = require('../models/file');
const User = require('../models/users');

// Ruta para guardar el archivo subido
router.post('/upload', async (req, res) => {
  try {
    const { userId, url, filename } = req.body;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear un nuevo registro de archivo
    const newFile = new File({
      userId: user._id,
      url: url,
      filename: filename
    });

    await newFile.save();
    res.status(201).json({ message: 'Archivo guardado exitosamente', file: newFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar el archivo' });
  }
});

// Ruta para obtener todos los archivos
router.get('/all', async (req, res) => {
    try {
      const files = await File.find(); // Buscar todos los archivos en la colección
      res.status(200).json(files); // Enviar los archivos encontrados al cliente
    } catch (error) {
      console.error('Error al obtener archivos:', error);
      res.status(500).json({ message: 'Error al obtener archivos' });
    }
  });
  

module.exports = router;
