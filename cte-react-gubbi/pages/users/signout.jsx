//// signout.jsx //////
import React, { useContext } from 'react';
import { useRouter } from 'next/router'; // Reemplaza useNavigate por useRouter
import UserContext from '../../context/user-context'; // Importa el contexto del usuario

const SignOutPage = () => {
  const router = useRouter(); // Usar useRouter en lugar de useNavigate
  const gubbiUser = useContext(UserContext);

  const handleLogout = () => {
    gubbiUser.logout(); // Llama la función logout del contexto
    router.push('/'); // Redirige a la página principal
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Video de fondo */}
      <video className="absolute top-0 left-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline>
        <source src="/LogoutBackGround.mp4" type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Capa de opacidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></div>

      {/* Contenido de la página de cierre de sesión */}
      <div className="relative z-20 w-full max-w-md p-8 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-6">¿Estás seguro que deseas cerrar sesión?</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default SignOutPage;