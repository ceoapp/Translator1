export interface TranslationItem {
  id: string;
  original: string;
  translated: string;
  timestamp: number;
}

export interface TranslationResponse {
  translatedText: string;
}
