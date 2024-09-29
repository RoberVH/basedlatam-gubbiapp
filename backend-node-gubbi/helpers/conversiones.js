// Utileria para convertir valores switch de process.env (siempre osn STRING) a su equivalente booleano
const Web3                           = require('web3');
const web3                           = new Web3();

exports.convertBool= (envVar) => {
    return (envVar.toUpperCase()==='TRUE');
}

exports.convStr2Bytes32= (str) => {
  return web3.utils.fromAscii(str);
}

exports.convBytes322Str= (bytes32) => {
    return web3.utils.toAscii(bytes32);
}