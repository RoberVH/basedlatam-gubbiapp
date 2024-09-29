// app.js

import './index.css';
import React from 'react';
import Headernavbar from './components/layout/headbar';
import SignInPage from './components/users/signin';
import SignOutPage from './components/users/signout';
import SignUpPage from './components/users/signup';
import Transferir from './components/pagos/transferencia';
import Tokenization from './components/pagos/tokenization'; 
import { Route, Routes } from 'react-router-dom'; 
import { UserContextProvider } from './context/user-context';
import MainPage from './components/main/MainPage'; // Importar la nueva página principal

function App() {
  return (
    <UserContextProvider>
      <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <Headernavbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainPage />} /> {/* Página principal */}
            <Route path="/usuario/signin" element={<SignInPage />} />
            <Route path="/usuario/signout" element={<SignOutPage />} />
            <Route path="/usuario/signup" element={<SignUpPage />} />
            <Route path="/pagos/transferencia" element={<Transferir />} />
            <Route path="/pagos/tokenization" element={<Tokenization />} />
          </Routes>
        </main>
      </div>
    </UserContextProvider>
  );
}

export default App;
