/////////// VoiceAssistant.js ///////////

import React        from 'react';


const VoiceAssistant = ({ onVoiceInput }) => {
    return (
        <div className="voice-assistant">
            <button onClick={onVoiceInput}>
                <i className="microphone-icon"></i> Iniciar Asistente de Voz
            </button>
        </div>
    );
}

export default VoiceAssistant;