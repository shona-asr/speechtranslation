export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type Language = 'english' | 'shona' | 'chinese' | 'ndebele' | 'auto';

export interface TranscriptionResult {
  originalAudio: string;
  language: string;
  transcription: string;
  confidence: number;
  words: TranscriptionWord[][];
}

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment {
  segment: string;
  words: TranscriptionWord[];
}

export interface TranslationResult {
  originalText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  translatedText: string;
  audioContent?: string;
}

export interface TextToSpeechResult {
  text: string;
  language: Language;
  audioBlob: Blob;
}

export interface SpeechToSpeechResult {
  originalAudio: Blob;
  originalText: string;
  originalLanguage: Language;
  translatedText: string;
  translatedLanguage: Language;
  translatedAudio: Blob;
}

export type HistoryItemType = 'transcription' | 'transcription_stream' | 'translation' | 'textToSpeech' | 'speechToSpeech';

export interface BaseHistoryItem {
  id: string;
  type: HistoryItemType;
  timestamp: number;
  userId: string;
}

export interface TranscriptionHistoryItem extends BaseHistoryItem {
  type: 'transcription';
  language: string;
  transcription: string;
  audioBlob?: Blob;
}

export interface TranscriptionStreamHistoryItem extends BaseHistoryItem {
  type: 'transcription_stream';
  language: string;
  transcription: string;
  audioBlob?: Blob;
}

export interface TranslationHistoryItem extends BaseHistoryItem {
  type: 'translation';
  sourceLanguage: Language;
  targetLanguage: Language;
  originalText: string;
  translatedText: string;
  audioBlob?: Blob;
}

export interface TextToSpeechHistoryItem extends BaseHistoryItem {
  type: 'textToSpeech';
  language: Language;
  text: string;
  audioBlob: Blob;
}

export interface SpeechToSpeechHistoryItem extends BaseHistoryItem {
  type: 'speechToSpeech';
  originalLanguage: Language;
  translatedLanguage: Language;
  originalText: string;
  translatedText: string;
  originalAudioBlob?: Blob;
  translatedAudioBlob: Blob;
}

export type HistoryItem = 
  | TranscriptionHistoryItem 
  | TranscriptionStreamHistoryItem
  | TranslationHistoryItem 
  | TextToSpeechHistoryItem 
  | SpeechToSpeechHistoryItem;
