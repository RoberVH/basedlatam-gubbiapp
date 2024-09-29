import { ethers } from 'ethers';

// Función para validar la clave privada
export const validarClavePrivada = (privateKey) => {
  if (!privateKey || privateKey.length !== 66 || !privateKey.startsWith('0x')) {
    throw new Error('Clave privada inválida o malformateada');
  }
};

// Función para realizar la transferencia de tokens
export const transferirTokens = async (privateKey, publicKeyDestino, cantidad) => {
  try {
    validarClavePrivada(privateKey);

    // Conectar a la red de Core TestNet
    const provider = new ethers.JsonRpcProvider("https://rpc.test.btcs.network");

    // Crear la wallet con la clave privada
    const wallet = new ethers.Wallet(privateKey, provider);

    // Consultar el saldo inicial
    const saldoInicial = await provider.getBalance(wallet.address);
    console.log(`Saldo inicial de la cuenta de origen: ${ethers.formatEther(saldoInicial)} tCORE`);

    // Obtener el precio del gas
    const gasPrice = ethers.parseUnits('50', 'gwei'); // Establecemos manualmente el gasPrice

    // Preparar la transacción
    const tx = {
      to: publicKeyDestino, // Cuenta de destino
      value: ethers.parseEther(cantidad), // Cantidad de tokens a enviar
      gasLimit: 21000, // Límite de gas
      gasPrice: gasPrice, // Precio del gas
    };

    // Firmar y enviar la transacción
    const txResponse = await wallet.sendTransaction(tx);
    console.log("Transacción enviada:", txResponse.hash);

    // Esperar a que la transacción sea confirmada
    const receipt = await txResponse.wait();
    console.log("Transacción confirmada en el bloque:", receipt.blockNumber);

    return receipt;
  } catch (error) {
    console.error("Error al realizar la transferencia:", error);
    throw error;
  }
};
