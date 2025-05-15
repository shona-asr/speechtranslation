import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeechResult } from "@/lib/types";
import { historyDB } from "@/lib/indexedDB";
import { useAuth } from "./useAuth";
import { v4 as uuidv4 } from "uuid";
import { API_ENDPOINTS } from "@/config/api";
import { getLanguageCode, getLanguageName } from "@shared/languages";

export function useTextToSpeech() {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const convertTextToSpeech = async (
    text: string,
    language: string
  ): Promise<TextToSpeechResult> => {
    if (!user) {
      throw new Error("You must be logged in to use text-to-speech");
    }

    if (!text.trim()) {
      throw new Error("Please enter text to convert to speech");
    }

    setIsConverting(true);

    try {
      const endpoint = API_ENDPOINTS.TEXT_TO_SPEECH;
      const languageCode = getLanguageCode(language);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Text-to-Speech failed: ${errorText}`);
      }

      const audioBlob = await response.blob();
      
      // Store in history
      const historyItem = {
        id: uuidv4(),
        type: "textToSpeech" as const,
        language: getLanguageName(languageCode) as any,
        text,
        audioBlob,
        timestamp: Date.now(),
        userId: user.uid,
      };

      await historyDB.addHistoryItem(historyItem);

      return {
        text,
        language: getLanguageName(languageCode) as any,
        audioBlob,
      };
    } catch (error) {
      toast({
        title: "Text-to-Speech Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

  return { convertTextToSpeech, isConverting };
}
