import React, { useState, useContext, useEffect } from 'react';
import UserContext from '../../context/user-context';
import VoiceAssistant from '../ui/VoiceAssistant';
import { transferirTokens, consultarSaldo } from '../../lib/blockchain'; // Usar las funciones adecuadas
import { ethers } from 'ethers';

const Transferir = (props) => {
  const [file, setFile] = useState(null); 
  const [entities, setVoiceTerms] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [saldo, setSaldo] = useState(null); // Estado para guardar el saldo
  const [formData, setFormData] = useState({
    source: '',
    dest: '',
    cant: '',
  });

  const gubbiUser = useContext(UserContext);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitVoiceFile = async (e) => {
    if (!file) {
      alert('Por favor, selecciona un archivo MP3');
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('http://localhost:4000/recognize/transfer', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la carga del archivo');
      }

      const data = await response.json();
      setVoiceTerms(data.entities);
      alert('Archivo subido exitosamente');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      source: gubbiUser.publickey,
    }));

    const obtenerSaldo = async () => {
      if (gubbiUser.publickey) {
        try {
          const balance = await consultarSaldo(gubbiUser.publickey);
          setSaldo(balance);
        } catch (error) {
          console.error("Error al consultar el saldo:", error);
        }
      }
    };

    obtenerSaldo();
  }, [gubbiUser.publickey]);

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
      // Realizar la transferencia usando Base Sepolia Testnet
      const receipt = await transferirTokens(gubbiUser.privatekey, dest, cant);
      console.log("Transacción exitosa:", receipt);
      alert('Transferencia exitosa en la red Base Sepolia');
    } catch (error) {
      console.error("Error al realizar la transferencia:", error);
      alert(`Error al realizar la transferencia: ${error.message}`);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* Video de fondo */}
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src="/CalendarBackGround.mp4" type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa de opacidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

      {/* Contenido principal */}
      <div className="relative z-20 w-full max-w-md p-8 bg-white bg-opacity-60 backdrop-blur-md rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">Transferir Tokens</h1>

        {/* Mostrar el saldo */}
        <div className="mb-4">
          <p className="text-center text-lg font-bold text-gray-700">
            Saldo disponible: {saldo ? `${saldo} ETH (Base Sepolia)` : 'Cargando...'}
          </p>
        </div>

        {/* Asistente de voz */}          
        <div className="flex flex-col space-y-2 justify-center text-center items-center">
          <input name="audio" type="file" accept=".mp3" onChange={handleFileChange} />
          <button onClick={handleSubmitVoiceFile} className="my-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer">
            Iniciar Asistente de Voz
          </button>
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
              className="mt-1 block w-full px-4 py-2 border border-gray-400 rounded-md"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-400 rounded-md"
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
              className="mt-1 block w-full px-4 py-2 border border-gray-400 rounded-md"
              placeholder="Ingresa la cantidad a transferir"
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={waiting}
              className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md"
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
