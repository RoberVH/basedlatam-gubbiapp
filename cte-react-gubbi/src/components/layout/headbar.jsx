// headbar.jsx

import React, { Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import logoFrutal from '../../assets/Frutal Web House 2024 - TH MX.png';
import gubbIcon2 from '../../assets/logoGubbiGIF.gif';
import UserContext from '../../context/user-context';

const Headernavbar = () => {
  const userGubbi = useContext(UserContext);

  return (
    <Fragment>
      <div className="relative">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <nav className="relative bg-gradient-to-r from-green-500 via-orange-400 to-red-500 bg-opacity-60 backdrop-blur-lg p-4 flex justify-between items-center shadow-lg rounded-b-lg border border-opacity-20 border-white">
          <a href="https://frutal-web-house-2024.devpost.com/" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <img src={logoFrutal} alt="Logo Frutal Web House 2024" title="Logo Frutal Web House 2024" className="h-12 drop-shadow-lg" />
          </a>

          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center text-white font-semibold hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
              <img src={gubbIcon2} alt="App Function 1" className="h-8 mr-2 drop-shadow-lg" />
              Gubbi App
            </a>

            <div className="space-x-4">
              <Link to="/usuario/signin" className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                Login
              </Link>
              <Link to="/usuario/signup" className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                Registrarse
              </Link>
              <Link to="/usuario/signout" className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                Logout
              </Link>
              <Link to="/pagos/transferencia" className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                Transferir
              </Link>
              <Link to="/pagos/tokenization" className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                Tokenization
              </Link> {/* Nuevo enlace */}
            </div>

            <div className="ml-6 text-sm text-white bg-opacity-30 p-2 rounded-lg backdrop-blur-lg">
              {userGubbi.username ? (
                <p>Usuario: {userGubbi.username} <br /> Dirección: {userGubbi.publickey}</p>
              ) : (
                <p>No hay usuario firmado</p>
              )}
            </div>
          </div>
        </nav>
      </div>
    </Fragment>
  );
};

export default Headernavbar;
