// components/main/MainPage.jsx

import React from 'react';

const MainPage = () => {
  return (
    <div className="container mx-auto py-12 px-6 bg-white shadow-lg rounded-lg">
      {/* Sección de bienvenida con descripción */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Bienvenido a Gubbi</h1>
        <p className="mt-4 text-gray-600 text-lg">
          Gubbi no es solo una aplicación, es un puente que conecta a las comunidades rurales con el mundo financiero moderno, rompiendo barreras de idioma, tecnología y acceso. Con cada transacción, acercamos a las personas a un futuro más justo, donde sus bienes físicos y esfuerzo tienen el valor que merecen.
        </p>
      </div>

      {/* Video explicativo */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-center mb-6">¿Cómo funciona Gubbi?</h2>
        <div className="flex justify-center">
          <video controls className="w-full max-w-3xl rounded-lg shadow-md">
            <source src="/path/to/video.mp4" type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      </div>

      {/* Audio guía en lengua nativa */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-center mb-4">Guía en tu lengua nativa</h2>
        <div className="flex justify-center">
          <audio controls className="w-full max-w-lg">
            <source src="/path/to/audio.mp3" type="audio/mpeg" />
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
        <p className="text-center mt-4 text-gray-500">
          Escucha la guía de uso en tu lengua nativa para aprender a utilizar Gubbi.
        </p>
      </div>

      {/* Estadísticas clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center mb-10">
        <div className="p-6 bg-blue-100 rounded-lg">
          <h3 className="text-2xl font-bold text-blue-600">68B</h3>
          <p className="text-gray-600 mt-2">Remesas</p>
        </div>
        <div className="p-6 bg-green-100 rounded-lg">
          <h3 className="text-2xl font-bold text-green-600">40%</h3>
          <p className="text-gray-600 mt-2">Población Desbancarizada</p>
        </div>
        <div className="p-6 bg-yellow-100 rounded-lg">
          <h3 className="text-2xl font-bold text-yellow-600">50B</h3>
          <p className="text-gray-600 mt-2">Economía Rural</p>
        </div>
        <div className="p-6 bg-red-100 rounded-lg">
          <h3 className="text-2xl font-bold text-red-600">20%</h3>
          <p className="text-gray-600 mt-2">Población Vive en Zonas Rurales</p>
        </div>
      </div>

      {/* Sección de servicios */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold mb-4">Servicios Ofrecidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Pagos Multichain</h3>
            <p className="text-gray-600 mt-2">Realiza pagos y compras a través de múltiples blockchains.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Transferencias Multichain</h3>
            <p className="text-gray-600 mt-2">Envía y recibe dinero desde cualquier cadena.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Captación de Remesas</h3>
            <p className="text-gray-600 mt-2">Gestiona y cobra remesas de manera rápida y segura.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Tokenización de Activos</h3>
            <p className="text-gray-600 mt-2">Tokeniza tus activos físicos para obtener valor digital.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Préstamos</h3>
            <p className="text-gray-600 mt-2">Accede a préstamos utilizando tus activos tokenizados como garantía.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Staking</h3>
            <p className="text-gray-600 mt-2">Obtén recompensas al hacer staking de tus tokens Gubbi.</p>
          </div>
        </div>
      </div>

      {/* Sección de Hackathon */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold mb-4">Apóyanos en el Hackathon</h2>
        <p className="text-gray-600">Difunde y retroalimenta nuestro proyecto para desarrollar nuevos módulos como el LLM-AI y la integración de nuestro token $Gubbi.</p>
      </div>
    </div>
  );
};

export default MainPage;
