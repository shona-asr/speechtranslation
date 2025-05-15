import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionResult } from "@/lib/types";
import { historyDB } from "@/lib/indexedDB";
import { useAuth } from "./useAuth";
import { v4 as uuidv4 } from "uuid";
import { API_ENDPOINTS } from "@/config/api";

export function useTranscribe_stream() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const transcribe_stream = async (
    audioFile: Blob | File,
    language: string = "auto"
  ): Promise<TranscriptionResult> => {
    // Remove authentication requirement for core functionality
    
    setIsTranscribing(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("audio_chunk", audioFile);
      formData.append("language", language);

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
        const historyItem = {
          id: uuidv4(),
          type: "transcription_stream" as const,
          language: result.language || language,
          transcription: result.transcription,
          audioBlob: audioFile,
          timestamp: Date.now(),
          userId: user?.uid || 'anonymous', // Add null check and fallback
        };

        await historyDB.addHistoryItem(historyItem);
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
