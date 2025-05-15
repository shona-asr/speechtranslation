import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult } from "@/lib/types";
import { historyDB } from "@/lib/indexedDB";
import { useAuth } from "./useAuth";
import { v4 as uuidv4 } from "uuid";
import { API_ENDPOINTS } from "@/config/api";
import { getLanguageCode } from "@shared/languages";

export function useTranscribe_stream() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const transcribe_stream = async (
    audioFile: Blob | File,
    language: string = "auto"
  ): Promise<TranscriptionResult> => {
    setIsTranscribing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("audio_chunk", audioFile);
      formData.append("language", getLanguageCode(language));
      console.log("language", language)
      // Determine the API endpoint
      const endpoint = API_ENDPOINTS.TRANSCRIBE_STREAM;

      setProgress(30);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const result = await response.json();
      setProgress(90);

      // Store in history only if user is logged in
      if (user) {
        // Ensure audio blob is properly formatted for storage
        let storageBlob = audioFile;
        
        // If it's a recording from the mic (which may have wav format), ensure it's stored with proper type
        if (audioFile instanceof Blob && audioFile.type === 'audio/wav') {
          const chunks = [await audioFile.arrayBuffer()];
          storageBlob = new Blob(chunks, { type: 'audio/wav' });
          console.log("Converted streaming audio blob for storage", storageBlob.size);
        }
        
        const historyItem = {
          id: uuidv4(),
          type: "transcription_stream" as const,
          language: getLanguageCode(language),
          transcription: result.transcription,
          audioBlob: storageBlob,
          timestamp: Date.now(),
          userId: user?.uid || 'anonymous',
        };

        try {
          await historyDB.addHistoryItem(historyItem);
          console.log("Successfully saved streaming transcription to history");
        } catch (storageError) {
          console.error("Failed to save streaming transcription to history:", storageError);
          // If saving with audio fails, try without audio
          const fallbackItem = {
            ...historyItem,
            audioBlob: undefined
          };
          await historyDB.addHistoryItem(fallbackItem);
          console.log("Saved streaming transcription to history without audio");
        }
      }
      setProgress(100);

      return result;
    } catch (error) {
      toast({
        title: "Transcription Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  return { transcribe_stream, isTranscribing, progress };
} 