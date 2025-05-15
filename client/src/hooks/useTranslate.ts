import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TranslationResult } from "@/lib/types";
import { historyDB } from "@/lib/indexedDB";
import { useAuth } from "./useAuth";
import { v4 as uuidv4 } from "uuid";
import { API_ENDPOINTS } from "@/config/api";
import { base64toBlob } from "@/lib/audio";
import { getLanguageCode, getLanguageName } from "@shared/languages";

export function useTranslate() {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const translate = async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult> => {
    if (!user) {
      throw new Error("You must be logged in to translate text");
    }

    if (!text.trim()) {
      throw new Error("Please enter text to translate");
    }

    setIsTranslating(true);

    try {
      // Determine the API endpoint
      const endpoint = API_ENDPOINTS.TRANSLATE;
      const sourceLanguageCode = getLanguageCode(sourceLanguage);
      const targetLanguageCode = getLanguageCode(targetLanguage);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLanguageCode,
          targetLanguage: targetLanguageCode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation failed: ${errorText}`);
      }

      const result = await response.json();
      
      // Store in history
      let audioBlob;
      if (result.audioContent) {
        audioBlob = base64toBlob(result.audioContent);
      }
      
      const historyItem = {
        id: uuidv4(),
        type: "translation" as const,
        sourceLanguage: getLanguageName(sourceLanguageCode) as any,
        targetLanguage: getLanguageName(targetLanguageCode) as any,
        originalText: text,
        translatedText: result.translatedText,
        audioBlob,
        timestamp: Date.now(),
        userId: user.uid,
      };

      await historyDB.addHistoryItem(historyItem);

      return {
        originalText: text,
        sourceLanguage: getLanguageName(sourceLanguageCode) as any,
        targetLanguage: getLanguageName(targetLanguageCode) as any,
        translatedText: result.translatedText,
        audioContent: result.audioContent,
      };
    } catch (error) {
      toast({
        title: "Translation Error",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  return { translate, isTranslating };
}
