import React, { useState, useEffect } from 'react';
import VoiceAssistant from '../ui/VoiceAssistant'; // Asistente de voz

const Tokenization = () => {
  const [activo, setActivo] = useState({
    tipo: 'Terreno',
    nombre: '',
    ubicacion: '',
    valor: '',
    tokensDisponibles: 1000,
  });

  const [transaccion, setTransaccion] = useState({
    cantidad: '',
    accion: 'comprar',
  });

  const [resultado, setResultado] = useState(null);
  const [archivos, setArchivos] = useState([]); // Para almacenar las URLs de los archivos
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null); // Archivo seleccionado por el usuario

  // Llamada al backend para obtener los archivos subidos
  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const response = await fetch('http://localhost:4000/files/all'); // Llamada al backend
        const data = await response.json();
        setArchivos(data); // Guardar los archivos en el estado
      } catch (error) {
        console.error('Error al obtener archivos:', error);
      }
    };

    fetchArchivos();
  }, []);

  const handleActivoChange = (e) => {
    setActivo({
      ...activo,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransaccionChange = (e) => {
    setTransaccion({
      ...transaccion,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransaccion = (e) => {
    e.preventDefault();
    const { cantidad, accion } = transaccion;
    if (!cantidad || isNaN(cantidad)) {
      alert('Por favor, introduce una cantidad válida.');
      return;
    }

    const totalTokens = accion === 'comprar'
      ? activo.tokensDisponibles - parseInt(cantidad)
      : activo.tokensDisponibles + parseInt(cantidad);

    setActivo((prevState) => ({
      ...prevState,
      tokensDisponibles: totalTokens,
    }));
    setResultado(`Has ${accion === 'comprar' ? 'comprado' : 'vendido'} ${cantidad} tokens`);
  };

  return (
    <div className="container mx-auto py-12 px-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-green-600">Tokenización de Activos Rurales</h1>
        <p className="text-gray-600 text-lg mb-8 text-center">
          Gubbi conecta a las comunidades rurales con el mundo financiero moderno, permitiendo la tokenización de activos como terrenos, ganado, maquinaria agrícola, y más.
        </p>

        {/* Sección para mostrar archivos subidos */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Selecciona un archivo para asociarlo al activo</h2>
          <div className="flex space-x-4 overflow-x-auto">
            {archivos.length > 0 ? (
              archivos.map((archivo) => (
                <div key={archivo._id} className="w-48 h-48 border border-gray-300 rounded-lg flex justify-center items-center">
                  <img
                    src={archivo.url}
                    alt={archivo.filename}
                    className="max-w-full max-h-full object-cover cursor-pointer"
                    onClick={() => setArchivoSeleccionado(archivo.url)}
                  />
                </div>
              ))
            ) : (
              <p>No hay archivos disponibles.</p>
            )}
          </div>
          {archivoSeleccionado && (
            <div className="mt-4">
              <p><strong>Archivo seleccionado:</strong></p>
              <img src={archivoSeleccionado} alt="Archivo seleccionado" className="max-w-full max-h-full object-cover" />
            </div>
          )}
        </div>

        {/* Formulario para detalles del activo */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Detalles del Activo</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                Tipo de Activo
              </label>
              <select
                id="tipo"
                name="tipo"
                value={activo.tipo}
                onChange={handleActivoChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Terreno">Terreno</option>
                <option value="Inmueble">Inmueble</option>
                <option value="Ganado">Ganado</option>
                <option value="Maquinaria Agrícola">Maquinaria Agrícola</option>
                <option value="Cultivos">Cultivos</option>
                <option value="Vehículo">Vehículo</option>
                <option value="Obra de arte">Obra de arte</option>
              </select>
            </div>

            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre del Activo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={activo.nombre}
                onChange={handleActivoChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa el nombre del activo"
              />
            </div>

            <div>
              <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">
                Ubicación
              </label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={activo.ubicacion}
                onChange={handleActivoChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa la ubicación"
              />
            </div>

            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                Valor del Activo (MXN)
              </label>
              <input
                type="number"
                id="valor"
                name="valor"
                value={activo.valor}
                onChange={handleActivoChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa el valor del activo"
              />
            </div>
          </form>
        </div>

        {/* Interfaz de transacciones */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Realiza una Transacción</h2>
          <form onSubmit={handleTransaccion} className="space-y-6">
            <div>
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">Cantidad de Tokens</label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                onChange={handleTransaccionChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Ingresa la cantidad de tokens"
              />
            </div>

            <div>
              <label htmlFor="accion" className="block text-sm font-medium text-gray-700">Acción</label>
              <select
                id="accion"
                name="accion"
                onChange={handleTransaccionChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="comprar">Comprar Tokens</option>
                <option value="vender">Vender Tokens</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700"
            >
              Realizar Transacción
            </button>
          </form>

          {resultado && (
            <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-md shadow-md">
              {resultado}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Navegación Asistida por Voz</h2>
          <div className="flex justify-center">
            <VoiceAssistant onVoiceInput={() => alert('Asistente de voz activado')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tokenization;





        