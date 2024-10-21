import '../styles/globals.css'; // Importa tu CSS global
import React from 'react';
import Headernavbar from './layout/headbar'; // Cambia la ruta según la estructura correcta
import { UserContextProvider } from '../context/user-context'; // Cambia la ruta a la nueva estructura

function MyApp({ Component, pageProps }) {
  return (
    <UserContextProvider>
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <Headernavbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
      </div>
    </UserContextProvider>
  );
}

export default MyApp;
