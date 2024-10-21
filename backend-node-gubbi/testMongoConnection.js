const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://gubbipay:U57AIv0sWB0agmR6@gubbi.8sico.mongodb.net/?retryWrites=true&w=majority&appName=Gubbi";

// Crear un MongoClient con las opciones para establecer la versión de la API
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Conectar el cliente al servidor (opcional a partir de la versión 4.7)
    await client.connect();
    
    // Enviar un ping para confirmar que la conexión fue exitosa
    await client.db("admin").command({ ping: 1 });
    console.log("¡Conexión exitosa a MongoDB!");
  } finally {
    // Asegura que el cliente se cerrará cuando termines o ocurra un error
    await client.close();
  }
}

// Ejecutar la función
run().catch(console.dir);
