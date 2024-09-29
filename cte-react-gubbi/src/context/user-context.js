////// user-context.js //////

import React, { useState, useEffect } from 'react';

const UserContext = React.createContext({
    username: null,
    token: null,
    publickey: null,
    cellnumber: null,
    login: () => {},
    logout: () => {}
});

export const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState({
        username: null,
        token: null,
        publickey: null,
        cellnumber: null
    });

    // Cargar el usuario desde localStorage cuando se monta el componente
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('gubbiUser'));
        console.log("Usuario cargado desde localStorage:", storedUser); // Verifica qué datos hay en el localStorage
        if (storedUser) {
          setUser(storedUser);
        }
      }, []); // Se ejecuta solo una vez al montar el componente
      


        const login = (userData) => {
                console.log("Usuario guardado en el contexto:", userData);
                localStorage.setItem('gubbiUser', JSON.stringify(userData));
                setUser({
                  username: userData.username,
                  token: userData.token,
                  publickey: userData.publickey,
                  privatekey: userData.privatekey, // Incluir la clave privada
                  cellnumber: userData.cellnumber,
                });
              };
              
        

    const logout = () => {
        localStorage.removeItem('gubbiUser');
        setUser({
            username: null,
            token: null,
            publickey: null,
            cellnumber: null
        });
    };

    return (
        <UserContext.Provider value={{ ...user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
