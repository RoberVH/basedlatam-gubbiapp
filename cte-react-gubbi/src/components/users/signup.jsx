//// signup.jsx //////


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useHookForm from '../../hooks/useHooksForm';
import enviarRequest from '../../lib/webaccess';
import BtnEnviar from '../ui/botonEnvio';
import LoginBackGround from '../../assets/LoginBackGround.mp4'; // Importa el video

const serverIp = process.env.REACT_APP_SERVER_ADDRESS;

const SignoUpPage = (props) => {
  const { values, handleChange, handleSubmit } = useHookForm(sendSignupData);
  const [waiting, setWaiting] = useState(false);
  const navigate = useNavigate();

  async function sendSignupData(event) {
    setWaiting(true);
    const { username, password, cpassw, cellnumber } = values;

    if (password !== cpassw) {
      alert('Contraseñas no coinciden, verificar');
      setWaiting(false);
      return;
    }

    const params = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&cellnumber=${encodeURIComponent(cellnumber)}`;
    const request = {
      method: 'POST',
      body: params,
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    };

    const url = `${serverIp}/usuario/signup`;
    try {
      const datos = await enviarRequest(url, request);
      alert(`Usuario ${username} creado exitosamente en Gubbi`);
      navigate('/usuario/signin');
    } catch (err) {
      console.log('En forma, el Error es:', err);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Video de fondo */}
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src={LoginBackGround} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa de opacidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60 z-10"></div>




    {/* Formulario de registro */}
    <div className="relative z-20 w-full max-w-md p-8 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">Registro de Usuario</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nombre Usuario
            </label>
            <input
                type="text"
                id="username"
                required
                onChange={handleChange}
                value={values.username || ''}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
            </div>

            <div>
            <label htmlFor="cellnumber" className="block text-sm font-medium text-gray-700">
                Número de Teléfono celular
            </label>
            <input
                type="text"
                id="cellnumber"
                onChange={handleChange}
                value={values.cellnumber || ''}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
            </div>

            <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
            </label>
            <input
                type="password"
                id="password"
                required
                onChange={handleChange}
                value={values.password || ''}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
            </div>

            <div>
            <label htmlFor="cpassw" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
            </label>
            <input
                type="password"
                id="cpassw"
                required
                onChange={handleChange}
                value={values.cpassw || ''}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            />
            </div>

            <div className="flex justify-center">
            <BtnEnviar label="Registrarse" waitflag={waiting} />
            </div>
        </form>
        </div>
    </div>
  );
};

export default SignoUpPage;
