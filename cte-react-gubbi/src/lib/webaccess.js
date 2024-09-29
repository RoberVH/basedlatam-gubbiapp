//import { isBreakOrContinueStatement } from "typescript";

/** enviarRequest
 * Recibe un URL y el objeto de parametros.
 * Genera un objeto Request a partir de los parametros y lo envia al server
 * Regresa una promesa con objeto: {status,msj}
 * El status es el codigo Http que el server devuelve
 */
export default  async function enviarRequest(url, requestObj) {

    const request = new Request(url,requestObj);
    console.log('emitiendo el fetch a',url) 
    console.log('requestObj',requestObj) 

      try { 

        let response= await fetch(request);
        let status=parseInt(response.status);
        console.log('R',status);
        if (status < 400) {
        console.log('webaccess exito 1',response);
        return response.json().then((resp) => {
            resp.status=status;
            console.log('webaccess exito 2',resp);  
            return (resp)})
        } else {
        console.log('webaccess fracaso 1:',response);
        return response.json().then((resp) =>  {
            console.table('webaccess fracaso 2:',resp)
            let srvRsp={}
            srvRsp.status=status;
            srvRsp.message=resp.message;
            console.log('por emitir error:',srvRsp)
            throw (srvRsp);

        })
        }
       } catch (err) {

          console.log('!error en fetch',err.message);
            if (err.message.search('NetworkError')>=0 || err.message.search('Failed to fetch')>=0) 
                throw ( ({status:404,message:"Error de Red, verifique conexión a servidor"}))
                else {
                    console.log('en catch de webacces, error es:',err)
                    throw ( (err))

                }
            }          

}

  