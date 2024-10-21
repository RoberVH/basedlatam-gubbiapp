///// web3config.js

// Configuración para los diferentes nodos Bundlr y redes
const web3ConfigNode1 = {
    currency: 'matic',
    serverAccPK: process.env.POLYGON_PVK_ACCOUNT,
    serverProviderLink: process.env.ALCHEMY_POLYGON_RPC_URL,
    bundlrNetwork: 'https://node1.bundlr.network'
};

const web3ConfigNode2 = {
    currency: 'matic',
    serverAccPK: process.env.POLYGON_PVK_ACCOUNT,
    serverProviderLink: process.env.ALCHEMY_POLYGON_RPC_URL,
    bundlrNetwork: 'https://node2.bundlr.network'
};

const web3ConfigDevNet = {
    currency: 'matic',
    serverAccPK: process.env.POLYGON_PVK_ACCOUNT,
    serverProviderLink: process.env.ALCHEMY_AMOY_RPC_URL, // Alchemy Amoy Testnet
    bundlrNetwork: 'https://devnet.bundlr.network' // Bundlr devnet para pruebas
};

// Cambia a web3ConfigDevNet para conectar con la red Amoy y Bundlr devnet
export const networkConfig = web3ConfigDevNet;


/* 
const web3ConfigNode1 = {
    currency: 'matic',
    serverAccPK : process.env.POLYGON_PVK_ACCOUNT,
    serverProviderLink: process.env.ALCHEMY_POLYGON_RPC_URL,
    bundlrNetwork:'https://node1.bundlr.network'
}

 const web3ConfigNode2 = {
    currency: 'matic',
    serverAccPK : process.env.POLYGON_PVK_ACCOUNT,
    serverProviderLink: process.env.ALCHEMY_POLYGON_RPC_URL,
    bundlrNetwork:'https://node2.bundlr.network'
}

const web3ConfigDevNet = {
    currency: 'matic',
    serverAccPK : process.env.POLYGON_PVK_ACCOUNT,
    serverProviderLink: process.env.ALCHEMY_AMOY_RPC_URL,
    bundlrNetwork:'https://devnet.bundlr.network'
}

//change to we3ConfigDevNet we3ConfigNode2 to connect working network
//export const networkConfig = web3ConfigNode2
export const networkConfig = web3ConfigDevNet
 */