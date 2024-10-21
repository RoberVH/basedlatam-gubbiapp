// valCamposRequer 
//      Lanza error si valor  no esta presente o es cadena vacia
//      (valor es un string)
//      Si todo bien devuelve el mismo valor (ya validado)

exports.valCamposRequer= (campo,valor,long) => {
    if (valor=== "undefined") {
        console.log(`error undefined en  ${campo}`) 
        throw new Error(`Falta valor en ${campo}`)
    } else if (valor==='') {
        console.log('error vacio') 
        throw new Error(`Falta valor en ${campo}`)
    } else if (typeof long !== undefined &&  valor.length > long) {
        console.log(`Longitud de ${campo} excedida`) 
        throw new Error(`Longitud de ${campo} excede ${long}`)
    }
    return valor;
}

