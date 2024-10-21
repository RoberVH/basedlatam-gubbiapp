import React, { Fragment, useContext } from 'react';
import Link from 'next/link'; // Importar el Link de Next.js
import UserContext from '../../context/user-context';

const Headernavbar = () => {
  const userGubbi = useContext(UserContext);

  return (
    <Fragment>
      <div className="relative">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <nav className="relative bg-gradient-to-b from-red-700 to-yellow-500 bg-opacity-60 backdrop-blur-lg p-4 flex justify-between items-center shadow-lg rounded-b-lg border border-opacity-20 border-white">
          <a href="https://baselatam.com/hackaton-base-latam" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <img src="/BaseLatam.jpg" alt="Logo Base latam Hack" title="Logo Base latam Hack" className="h-12 drop-shadow-lg" />
          </a>

          <div className="flex items-center space-x-4">
            <Link href="/" passHref>
              <a className="flex items-center text-white font-semibold hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
                <img src="/logoGubbiGIF.gif" alt="App Function 1" className="h-8 mr-2 drop-shadow-lg" />
                <span>Gubbi App</span>
              </a>
            </Link>

            <div className="space-x-4">
              <Link href="/users/signin">
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                  Login
                </a>
              </Link>
              <Link href="/users/signup">
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                  Registrarse
                </a>
              </Link>
              <Link href="/users/signout">
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                  Logout
                </a>
              </Link>
              <Link href="/pagos/transferencia">
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                  Transferir
                </a>
              </Link>
              <Link href="/pagos/tokenization">
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                  Tokenization
                </a>
              </Link>
              <Link href="/upload">
                <a className="text-white hover:text-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 font-medium">
                  Subir Archivos
                </a>
              </Link>
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
