
export const API_BASE_URL = '/api';
//export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  TRANSCRIBE: `${API_BASE_URL}/transcribe`,
  TRANSCRIBE_STREAM: `${API_BASE_URL}/transcribe_stream`,
  TRANSLATE: `${API_BASE_URL}/translate`,
  TEXT_TO_SPEECH: `${API_BASE_URL}/text-to-speech`,
  SPEECH_TO_SPEECH: `${API_BASE_URL}/speech-to-speech-translate`,
  USER_STATS: `${API_BASE_URL}/user-stats`,
  
}; 
