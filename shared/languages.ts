/**
 * Language mapping utility
 * 
 * This file provides mappings between language names and their corresponding
 * ISO language codes. This is useful when different services expect different
 * formats (names vs codes).
 */

// Map from language names to ISO codes
export const LANGUAGE_TO_CODE: Record<string, string> = {
  'autodetect': 'auto',
  'auto': 'auto',
  'shona': 'sn',
  'english': 'en',
  'chinese': 'zh',
  'ndebele': 'nr'
};

// Map from ISO codes to language names
export const CODE_TO_LANGUAGE: Record<string, string> = {
  'auto': 'autodetect',
  'sn': 'shona',
  'en': 'english',
  'zh': 'chinese',
  'nr': 'ndebele'
};

/**
 * Convert a language name to its corresponding ISO code
 * @param language Language name (e.g., 'english')
 * @returns The ISO code (e.g., 'en') or 'auto' if not found
 */
export function getLanguageCode(language: string): string {
  // Convert to lowercase to ensure case-insensitive matching
  const normalizedLanguage = language.toLowerCase();
  return LANGUAGE_TO_CODE[normalizedLanguage] || 'auto';
}

/**
 * Convert an ISO language code to its corresponding language name
 * @param code ISO language code (e.g., 'en')
 * @returns The language name (e.g., 'english') or 'autodetect' if not found
 */
export function getLanguageName(code: string): string {
  // Convert to lowercase to ensure case-insensitive matching
  const normalizedCode = code.toLowerCase();
  return CODE_TO_LANGUAGE[normalizedCode] || 'autodetect';
}

/**
 * Get list of all supported languages as objects with name and code
 * Useful for dropdown menus and selectors
 */
export function getSupportedLanguages(includeAuto: boolean = true): Array<{name: string, code: string}> {
  const languages = Object.entries(LANGUAGE_TO_CODE)
    .filter(([name]) => includeAuto || name !== 'autodetect')
    .map(([name, code]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      code
    }));
  
  // Sort alphabetically by name, but keep 'autodetect' at the top if included
  return languages.sort((a, b) => {
    if (a.code === 'auto') return -1;
    if (b.code === 'auto') return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Service-specific language format converters
 * These functions handle the specific requirements of different services
 */

/**
 * Convert language for speech-to-speech service
 * Source language should be a code, target language should be a name
 */
export function formatSpeechToSpeechLanguages(sourceLanguage: string, targetLanguage: string): {
  sourceLanguage: string;
  targetLanguage: string;
} {
  return {
    sourceLanguage: getLanguageCode(sourceLanguage), // Convert to code
    targetLanguage: getLanguageName(targetLanguage)  // Convert to name
  };
}

/**
 * Convert language for transcription service
 * Both source and target should be codes
 */
export function formatTranscriptionLanguages(language: string): string {
  return getLanguageCode(language);
}

/**
 * Convert language for translation service
 * Both source and target should be codes
 */
export function formatTranslationLanguages(sourceLanguage: string, targetLanguage: string): {
  sourceLanguage: string;
  targetLanguage: string;
} {
  return {
    sourceLanguage: getLanguageCode(sourceLanguage),
    targetLanguage: getLanguageCode(targetLanguage)
  };
}

/**
 * Validate if a language is supported
 * @param language Language name or code to validate
 * @returns boolean indicating if the language is supported
 */
export function isLanguageSupported(language: string): boolean {
  const normalizedLanguage = language.toLowerCase();
  return normalizedLanguage in LANGUAGE_TO_CODE || normalizedLanguage in CODE_TO_LANGUAGE;
}

/**
 * Get display name for a language (for UI purposes)
 * @param language Language name or code
 * @returns Formatted display name
 */
export function getDisplayName(language: string): string {
  const name = getLanguageName(language);
  return name.charAt(0).toUpperCase() + name.slice(1);
}