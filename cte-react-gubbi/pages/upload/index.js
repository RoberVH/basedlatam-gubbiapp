import styles from "../../styles/Home.module.css"; // Ajusta la ruta al archivo de estilo
import { useState, useEffect, useRef, useCallback, useContext } from "react";
import WebBundlr from "@bundlr-network/client/build/web";
import { providers, utils } from "ethers";
import BigNumber from "bignumber.js";
import { getRemoteBundler, uploadData } from "../utils/bundlr";
import { networkConfig } from "../web3/web3config"
import Image from "next/image";
import UserContext from '../../context/user-context'; // Importar contexto de usuario




export default function Home() {
  const [file, setFile] = useState()    // input file value
  const [fileData, setFileData] = useState()  // file data read from user's disk
  const [funds, setFunds] = useState("0.02")  // suggested Matic to transfer to Bundlr to fund it
  const [connected, setConnected] = useState(false)
  const [balance, setBalance] = useState()
  const [account, setAccount] = useState()
  const [remoteBundlr, setRemoteBundlr] = useState()
  const [remoteBundlrBalance, setRemBndlrBal] = useState()
  const [uploadedLinks, setUploads] = useState([])
  const [uploading, setuploading] = useState(false)
  const webBundlr = useRef()
  const provider = useRef()
  const gubbiUser = useContext(UserContext) // Obtener usuario del contexto

  
  const getRmteBal = useCallback(async () => {
    if (remoteBundlr && remoteBundlr.address && WebBundlr) {
      const bal = await webBundlr.current.getBalance(remoteBundlr.address);
      setRemBndlrBal(webBundlr.current.utils.unitConverter(bal));
    }
  },[remoteBundlr]);

  useEffect(() => {
    getRmteBal();
  }, [remoteBundlr, getRmteBal]);

  function parseInput(input) {
    const conv = new BigNumber(input).multipliedBy(
      webBundlr.current.currencyConfig.base[1]

    );
    if (conv.isLessThan(1)) {
      console.log("error: value too small");
      return;
    } else {
      return conv;
    }
  }
  const handleFundAccount = async () => {
    if (!funds) {
      alert("Need a valid fund!");
      return;
    }
    const amountParsed = parseInput(funds);
    let response = await webBundlr.current.fund(amountParsed); // fund amount in ars
    const bal = await webBundlr.current.getLoadedBalance();
    setBalance(utils.formatEther(bal.toString()));
    setFunds("");
  };

  const handleinitRemoteBundrl = async () => {
    const remoteBundlr = await getRemoteBundler();
    setRemoteBundlr(remoteBundlr);
  };


//////////// Upload file to server
const uploadFileServer = async () => {
  if (!fileData) {
    alert("Choose a File first!");
    return;
  }

  try {
    setuploading(true); // Indicar que se está subiendo

    // Subir el archivo a Web3/Bundlr y obtener la URL
    const result = await uploadData(remoteBundlr, webBundlr, file, fileData);

    if (result.status) {
      console.log('result', result);

      // URL generada después de la subida
      const fileUrl = `https://gateway.irys.xyz/${result.txid}`;

      // Obtener el userId desde el contexto
      const userId = gubbiUser.userId;

      if (!userId) {
        alert('Error: No se ha encontrado el ID del usuario.');
        return;
      }

      // Crear el cuerpo de la solicitud con el userId y la URL del archivo
      const bodyData = JSON.stringify({
        userId: userId,
        url: fileUrl,
        filename: file.name
      });

      // Enviar la URL y la información al backend
      const response = await fetch('http://localhost:4000/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyData, // El cuerpo en formato JSON
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Archivo guardado en MongoDB:', data);

        // Actualizar la lista de archivos subidos
        setUploads((rest) => [...rest, [result.txid, fileUrl]]);
        getRmteBal(); // Actualizar el balance
      } else {
        alert('Error al guardar el archivo en el backend');
      }
    } else {
      alert('Algo salió mal al subir el archivo.');
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    alert('Ocurrió un error durante la subida.');
  } finally {
    setuploading(false); // Indicar que la subida ha terminado
  }
};

////////////  


  const handleFileChange = async (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    setFile(file)
    if (file) {
      reader.onloadend = () => {
        if (reader.result) {
          setFileData(Buffer.from(reader.result));
        }
      };
      reader.readAsArrayBuffer(file);
    }
    console.log("file to upload:", file.type);

  };

  const handleConnectMM = async () => {
    if (!window.ethereum) {
      alert("Metamask not found!");
      return;
    }
    await window.ethereum.enable();
    provider.current = new providers.Web3Provider(window.ethereum);
    console.log('provider.current',provider.current)
    await provider.current._ready();
    webBundlr.current = new WebBundlr(
      networkConfig.bundlrNetwork,
      networkConfig.currency,
      provider.current
    );
    await webBundlr.current.ready();
    const amountParsed = new BigNumber(funds).multipliedBy(
      webBundlr.current.currencyConfig.base[1]
    );

    let bal0 = await webBundlr.current.getLoadedBalance();
    let bal1 = utils.formatEther(bal0.toString());
    setBalance(bal1);
    setConnected(true);
    setAccount(webBundlr.current.address);
  };

  const UploadButton=({uploading}) => {
    console.log('button')
  if (!uploading) return (     
      <button className={styles.button} onClick={uploadFileServer}>
        Upload via Server
      </button >
      )
      else return (
        <button className={styles.button}>
            <Image className={styles.spinning} alt='iconuploading' src="/whitearrow.png" width={15} height={13}></Image>
          &nbsp; Loading...
        </button>
      )
  };

  if (!connected)
    return (
      <div className={styles.container}>
        <button
          style={{ marginTop: "2em" }}
          className={styles.button}
          onClick={handleConnectMM}
        >
          Connect Wallet
        </button>
      </div>
    );
  else
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ position: 'absolute', 
                      top:'2%', 
                      left:'70%',
                      padding:'0.8em', 
                      marginLeft: "auto", 
                      marginRight: "1em", 
                      backgroundColor:'#d2e2f4', fontSize:'11px' }}>
          <label className={styles.labels} style={{ padding: "0.5em" }}>
            <strong>Web Account: &nbsp;</strong>
            {account.substring(0, 6) +
              "..." +
              account.substring(account.length - 4)}
          </label>
          <label className={styles.labels} style={{ padding: "0.5em" }}>
            <strong>Bundlr&lsquo;s Bal:&nbsp;</strong>{" "}
            {Number(balance).toFixed(5)}
          </label>
          <div>

          {remoteBundlr && (
            <div>
              <label className={styles.labels2} style={{ padding: "0.5em" }}>
                <strong>Server Account: &nbsp;</strong>
                {remoteBundlr.address.substring(0, 6) +
                  "..." +
                  remoteBundlr.address.substring(
                    remoteBundlr.address.length - 4
                  )}
              </label>
              <label className={styles.labels2} style={{ padding: "0.5em" }}>
                <strong>Bundlr&lsquo;s Bal:&nbsp;</strong>
                {Number(remoteBundlrBalance).toFixed(5)}
              </label>
              </div>
          )}
          </div>
          <label className={styles.labels} style={{ padding: "0.5em;" }}>
            <strong>Network:&nbsp;</strong>{" "}
            {`ID: ${provider.current.network.chainId} Name: ${provider.current.network.name}`}
            {console.log('p',provider.current)}
          </label>
          <br></br>
          <label className={styles.labels} style={{ padding: "0.5em" }}>
            <strong>Bndlr Network:&nbsp;</strong>{" "}
            {networkConfig.bundlrNetwork}
          </label>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "25px",
          }}
        >
          <div>
            {!remoteBundlr && (
              <div style={{ margin: "2em" }}>
                <button
                  className={styles.button}
                  onClick={handleinitRemoteBundrl}
                >
                  Initialize Remote Bundlr
                </button>
              </div>
            )}
          </div>
          <div>
            <input
              type="number"
              value={funds}
              style={{
                fontSize: "1.3em",
                height: "1.9em",
                width: "5em",
                marginTop: "0.5em",
                marginLeft: "2em",
                marginRight: "2em",
              }}
              onChange={(e) => setFunds(e.currentTarget.value)}
            ></input>
            <button className={styles.button} onClick={handleFundAccount}>
              Fund Own Web Account
            </button>
          </div>
        </div>
        {remoteBundlr && (
          <div style={{ marginTop: "2em" }}>
            <div style={{ margin: "2em" }}>
              <label className={styles.labels}>File to Upload:</label>
              <input
                style={{
                  margin: "20px",
                  outline: "solid 1px green",
                  width: "50%",
                  fontSize: "1.2rem",
                  background: "#6c92bd",
                  color: "white",
                }}
                type="file"
                onChange={(e) => handleFileChange(e)}
              />
              {fileData && <UploadButton uploading={uploading}/>}
              <div>
                {(uploadedLinks.length!==0) && 
                    <ul style={{listStyleType:'none', fontSize:'1.1em', margin:'3em 8em'}}>
                      <label style={{margin:'2em 0em'}}><strong>Loaded Files Links</strong></label>
                    {uploadedLinks.map((link) => 
                      <li key={link[0]} style={{color:'blue',margin:'1em'}}>
                        <a href={link[1]} target="_blank" rel="noreferrer">
                          {link[1]}
                        </a>
                      </li>
                    )}
                  </ul>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );


}
