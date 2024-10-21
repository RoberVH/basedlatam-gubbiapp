// components/pagos/Tokenization.jsx

import React, { useState } from 'react';
import VoiceAssistant from '../ui/VoiceAssistant'; // Asistente de voz

const Tokenization = () => {
  // Estado para los detalles del activo
  const [activo, setActivo] = useState({
    tipo: 'Terreno',
    nombre: '',
    ubicacion: '',
    valor: '',
    tokensDisponibles: 1000,
  });

  // Estado para las transacciones
  const [transaccion, setTransaccion] = useState({
    cantidad: '',
    accion: 'comprar',
  });

  // Estado para el resultado de la transacción
  const [resultado, setResultado] = useState(null);

  // Manejar cambios en el formulario de detalles del activo
  const handleActivoChange = (e) => {
    setActivo({
      ...activo,
      [e.target.name]: e.target.value,
    });
  };

  // Manejar cambios en el formulario de transacciones
  const handleTransaccionChange = (e) => {
    setTransaccion({
      ...transaccion,
      [e.target.name]: e.target.value,
    });
  };

  // Simulación de transacción
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
              <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700">
                Cantidad de Tokens
              </label>
              <input
                type="number"
                id="cantidad"
                name="cantidad"
                onChange={handleTransaccionChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingresa la cantidad de tokens"
              />
            </div>

            <div>
              <label htmlFor="accion" className="block text-sm font-medium text-gray-700">
                Acción
              </label>
              <select
                id="accion"
                name="accion"
                onChange={handleTransaccionChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500"
              >
                <option value="comprar">Comprar Tokens</option>
                <option value="vender">Vender Tokens</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Realizar Transacción
            </button>
          </form>

          {/* Mostrar el resultado de la transacción */}
          {resultado && (
            <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-md shadow-md">
              {resultado}
            </div>
          )}
        </div>

        {/* Asistente de voz */}
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
