import React, { useState, useContext, useEffect } from 'react';
import UserContext from '../../context/user-context';
import CalendarBackGround from '../../assets/CalendarBackGround.mp4'; // Importa el video
import VoiceAssistant from '../ui/VoiceAssistant'; // Asistente de voz
import { transferirTokens } from '../../lib/blockchain'; // Asegúrate de estar usando esta función
import { ethers } from 'ethers'; // Importar ethers.js

const Transferir = (props) => {
  const [waiting, setWaiting] = useState(false);
  const [saldo, setSaldo] = useState(null); // Estado para guardar el saldo
  const [formData, setFormData] = useState({
    source: '',
    dest: '',
    cant: '',
  });

  const gubbiUser = useContext(UserContext);

  useEffect(() => {
    // Predefine la cuenta de origen con la publicKey del usuario
    setFormData((prevState) => ({
      ...prevState,
      source: gubbiUser.publickey,
    }));

    // Función para obtener el saldo usando ethers.js
    const obtenerSaldo = async () => {
      if (gubbiUser.publickey) {
        try {
          const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network"); // Core TestNet URL
          const balance = await provider.getBalance(gubbiUser.publickey);
          setSaldo(ethers.formatEther(balance)); // Convierte el balance a formato ether
        } catch (error) {
          console.error("Error al consultar el saldo:", error);
        }
      }
    };

    obtenerSaldo(); // Llama la función al montar el componente
  }, [gubbiUser.publickey]); // Solo se ejecuta si cambia la publickey

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleTransferir = async (e) => {
    e.preventDefault();
    setWaiting(true);
    const { source, dest, cant } = formData;
  
    if (!source || !dest || !cant) {
      alert('Por favor, completa todos los campos.');
      setWaiting(false);
      return;
    }
  
    if (!gubbiUser.privatekey) {
      alert('Clave privada no encontrada.');
      setWaiting(false);
      return;
    }

    try {
      // Llamada a la función transferirTokens
      const receipt = await transferirTokens(gubbiUser.privatekey, dest, cant);
      console.log('Transacción completada:', receipt);
      alert('Transferencia exitosa');
    } catch (error) {
      console.error("Error al realizar la transferencia:", error);
      alert(`Error al realizar la transferencia: ${error.message}`);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Video de fondo */}
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src={CalendarBackGround} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa de opacidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

      {/* Contenido principal */}
      <div className="relative z-20 w-full max-w-md p-8 bg-white bg-opacity-60 backdrop-blur-sm rounded-lg shadow-lg border border-gray-50">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">Transferir Tokens</h1>
        
        {/* Mostrar el saldo */}
        <div className="mb-4">
          <p className="text-center text-lg font-bold text-gray-700">
            Saldo disponible: {saldo ? `${saldo} tCORE` : 'Cargando...'}
          </p>
        </div>

        {/* Asistente de voz */}
        <div className="flex justify-center mb-4">
          <VoiceAssistant onVoiceInput={() => alert('Asistente de voz activado')} />
        </div>

        <form onSubmit={handleTransferir} className="space-y-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Cuenta Origen
            </label>
            <input
              type="text"
              id="source"
              readOnly
              value={formData.source}
              className="mt-1 block w-full px-4 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out"
            />
          </div>

          <div>
            <label htmlFor="dest" className="block text-sm font-medium text-gray-700">
              Cuenta Destino
            </label>
            <input
              type="text"
              id="dest"
              required
              onChange={handleChange}
              value={formData.dest}
              className="mt-1 block w-full px-4 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out"
              placeholder="Ingresa la cuenta de destino"
            />
          </div>

          <div>
            <label htmlFor="cant" className="block text-sm font-medium text-gray-700">
              Cantidad de Tokens
            </label>
            <input
              type="number"
              id="cant"
              required
              onChange={handleChange}
              value={formData.cant}
              className="mt-1 block w-full px-4 py-2 border border-gray-400 rounded-md shadow-sm focus:ring-4 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out"
              placeholder="Ingresa la cantidad a transferir"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={waiting}
              className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              {waiting ? 'Procesando...' : 'Transferir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Transferir;
