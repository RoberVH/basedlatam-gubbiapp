/////// botonEnvio.js ///////

import React        from 'react';

// Props esperados
//     label    :  string  etiqueta el boton
//     waiting  :  bool permite manejar el css (por ejemplo inhabilitar boton) durante procesamiento
//    

const BtnEnviar = (props) => {
    
    
    return (
            <button className="" disabled={props.waiting} type="submit">{props.label}</button>
        )
    }



export default BtnEnviar;