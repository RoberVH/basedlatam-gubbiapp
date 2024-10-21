import { ethers } from 'ethers';

// Obtener el proveedor de la red Base Sepolia desde las variables de entorno
const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL);

// Función para crear una nueva wallet y conectarla al proveedor de Base Sepolia
export async function crearWallet() {
  const wallet = ethers.Wallet.createRandom();
  return wallet.connect(provider);
}

// Función para transferir tokens en la red Base Sepolia
export const transferirTokens = async (privateKey, publicKeyDestino, cantidad) => {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);

    const saldoInicial = await provider.getBalance(wallet.address);
    console.log(`Saldo inicial de la cuenta de origen: ${ethers.utils.formatEther(saldoInicial)} ETH`);

    const cantidadWei = ethers.utils.parseEther(cantidad);
    if (saldoInicial.lt(cantidadWei)) {
      throw new Error('Saldo insuficiente para la transferencia');
    }

    const tx = {
      to: publicKeyDestino,
      value: cantidadWei,
      gasLimit: 21000,
    };

    const txResponse = await wallet.sendTransaction(tx);
    console.log("Transacción enviada:", txResponse.hash);

    const receipt = await txResponse.wait();
    console.log("Transacción confirmada en el bloque:", receipt.blockNumber);

    return receipt;
  } catch (error) {
    console.error("Error al realizar la transferencia:", error);
    throw error;
  }
};

// Función para consultar el saldo de una dirección en la red Base Sepolia
export const consultarSaldo = async (direccion) => {
  try {
    const balance = await provider.getBalance(direccion);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error al consultar el saldo:", error);
    throw error;
  }
};
