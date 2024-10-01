//const  AssemblyAI = require( 'assemblyai')
const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({
    apiKey: process.env.LLM_MODEL_API || ''
   });

  //const client = AssemblyAI({ apiKey: process.env.LLM_MODEL_API || ''});


exports.reconigzeVoice= async(mp3FilePath) => {
const recognizedText=[]
try {
    // Lee el archivo de audio
    console.log('environement:', process.env.NODE_ENV)
    if (process.env.NODE_ENV==='production') 
    console.log('input file to process: ', mp3FilePath)

    // Prepara los parámetros para AssemblyAI
    const params = {
      audio: mp3FilePath,
      entity_detection: true,
      language_code: 'es'
    };

    const run = async () => {
      const transcript = await client.transcripts.transcribe(params)
      if (transcript.status === 'error') {
        console.error('error de transcripcion:', transcript.error)
        return 
      }
    
     
      for (const entity of transcript.entities) {
        console.log(`Timestamp: ${entity.start} - ${entity.end}\n`)
        console.log(entity.entity_type)
        console.log(entity.text)
        recognizedText.push({
          type: entity.entity_type,
          text: entity.text,
        })
      }

} 
console.log('por ejecutar run')
await run()
console.log('por regresar recognizedText', recognizedText)

return { status: true, recognizedText}

} catch (error) {
    console.error('Error al procesar el archivo de audio:', error);
    return {status: false, error}
    }
}