import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SpeechToSpeechResult, SpeechToSpeechHistoryItem } from "@/lib/types";
import { historyDB } from "@/lib/indexedDB";
import { useAuth } from "./useAuth";
import { v4 as uuidv4 } from "uuid";
import { base64toBlob } from "@/lib/audio";
import { API_ENDPOINTS } from "@/config/api";
import { getLanguageCode, getLanguageName } from "@shared/languages";

export function useSpeechToSpeech() {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); 

  const convertSpeechToSpeech = async (
    audioFile: Blob | File,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<SpeechToSpeechResult> => {
    setIsConverting(true);

    try {
      const sourceLanguageCode = getLanguageCode(sourceLanguage);
      const targetLanguageCode = getLanguageCode(targetLanguage);

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("sourceLanguage", sourceLanguageCode);
      formData.append("targetLanguage", targetLanguage);

      // Determine the API endpoint
      const endpoint = API_ENDPOINTS.SPEECH_TO_SPEECH;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Speech-to-Speech translation failed: ${errorText}`);
      }

      const result = await response.json();

      // Create translated audio blob from the synthesizedAudio field
      console.log("S2S API response:", result);
      const translatedAudioBlob = result.synthesizedAudio ? 
        base64toBlob(result.synthesizedAudio) : 
        new Blob([], { type: 'audio/mp3' });

      // Store in history
      // Ensure audio blob is properly formatted for storage
      let storageOriginalBlob = audioFile;

      // If it's a recording from the mic (which may have wav format), ensure it's stored with proper type
      if (audioFile instanceof Blob && audioFile.type === 'audio/wav') {
        const chunks = [await audioFile.arrayBuffer()];
        storageOriginalBlob = new Blob(chunks, { type: 'audio/wav' });
        console.log("Converted speech-to-speech audio blob for storage", storageOriginalBlob.size);
      }

      const historyItem = {
        id: uuidv4(),
        type: "speechToSpeech" as const,
        originalLanguage: getLanguageName(sourceLanguageCode) as any,
        translatedLanguage: getLanguageName(targetLanguageCode) as any,
        originalText: result.originalText,
        translatedText: result.translatedText,
        originalAudioBlob: storageOriginalBlob,
        translatedAudioBlob,
        timestamp: Date.now(),
        userId: user?.uid || 'anonymous',
      };

      try {
        await historyDB.addHistoryItem(historyItem);
        console.log("Successfully saved speech-to-speech to history");
      } catch (storageError) {
        console.error("Failed to save speech-to-speech to history:", storageError);
        // If saving with audio fails, try with just the translated audio
        const fallbackItem: SpeechToSpeechHistoryItem = {
          ...historyItem,
          originalAudioBlob: undefined,
        };
        await historyDB.addHistoryItem(fallbackItem);
        console.log("Saved speech-to-speech to history without original audio");
      }

      return {
        originalAudio: audioFile,
        originalText: result.originalText,
        originalLanguage: getLanguageName(sourceLanguageCode) as any,
        translatedText: result.translatedText,
        translatedLanguage: getLanguageName(targetLanguageCode) as any,
        translatedAudio: translatedAudioBlob,
      };
    } catch (error) {
      toast({
        title: "Speech-to-Speech Translation Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

  return { convertSpeechToSpeech, isConverting };
}
