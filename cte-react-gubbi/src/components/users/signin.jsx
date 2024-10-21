///////////    Sign In Page    ////////////


import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/user-context';
import useHookForm from '../../hooks/useHooksForm';
import enviarRequest from '../../lib/webaccess';
import VoiceAssistant from '../ui/VoiceAssistant';
import SignInForm from '../ui/SignInForm';
import PyramidBackGround from '../../assets/PyramidBackGroundRepeat.mp4'; // Importa el video

const serverIp = process.env.REACT_APP_SERVER_ADDRESS;

const SignInPage = (props) => {
  const { values, handleChange, handleSubmit } = useHookForm(sendSignInData);
  const [waiting, setWaiting] = useState(false);
  const navigate = useNavigate();
  const gubbiUser = useContext(UserContext);

  
  async function sendSignInData(event) {
    setWaiting(true);
    const { username, password } = values;
  
    const params = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const request = {
      method: 'POST',
      mode: 'cors',
      body: params,
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
    };
    const url = `${serverIp}/usuario/signin`;
    try {
      const datos = await enviarRequest(url, request);
      if (datos.token) {
        gubbiUser.login({
            username: datos.username,
            token: datos.token,
            publickey: datos.publickey,
            privatekey: datos.privatekey,
            cellnumber: datos.cellnumber
        });
        navigate('/');
      } else {
          alert('Credenciales erróneas');
      }
    
    } catch (err) {
      alert('Error al iniciar sesión, por favor intenta nuevamente.');
    } finally {
      setWaiting(false);
    }
  }
  

  return (
    <div className="relative w-full h-screen"> {/* Contenedor principal */}

      {/* Video de fondo */}
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src={PyramidBackGround} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa de opacidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60 z-10"></div>

      {/* Contenido de inicio de sesión */}
      <div className="absolute z-20 flex flex-col items-center justify-center w-full h-full text-white">
        <h1 className="text-3xl font-bold mb-6">Iniciar Sesión en Gubbi</h1>
        <VoiceAssistant onVoiceInput={() => alert("Asistente de voz activado")} />
        
        {/* Modificar la opacidad del contenedor */}
        <div className="w-full max-w-md bg-white bg-opacity-70 p-8 rounded-md shadow-lg text-gray-500 backdrop-blur-sm">
          <SignInForm
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            values={values}
            waiting={waiting}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;



