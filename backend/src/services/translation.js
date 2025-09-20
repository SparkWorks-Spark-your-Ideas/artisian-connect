import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import { config } from '../config/index.js';

const translate = new Translate({
  projectId: config.googleCloud.projectId,
  keyFilename: config.googleCloud.credentials
});

/**
 * Translate text to target language
 */
export const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  try {
    const [translation] = await translate.translate(text, {
      from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      to: targetLanguage
    });

    // Detect source language if not provided
    const [detection] = sourceLanguage === 'auto' 
      ? await translate.detect(text)
      : [{ language: sourceLanguage }];

    return {
      originalText: text,
      translatedText: translation,
      sourceLanguage: detection.language,
      targetLanguage,
      confidence: detection.confidence || 1
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
};

/**
 * Get supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    const [languages] = await translate.getLanguages();
    return languages.map(lang => ({
      code: lang.code,
      name: lang.name
    }));
  } catch (error) {
    console.error('Get languages error:', error);
    throw new Error('Failed to get supported languages');
  }
};

/**
 * Detect language of text
 */
export const detectLanguage = async (text) => {
  try {
    const [detection] = await translate.detect(text);
    return {
      language: detection.language,
      confidence: detection.confidence
    };
  } catch (error) {
    console.error('Language detection error:', error);
    throw new Error('Failed to detect language');
  }
};

/**
 * Translate multiple texts in batch
 */
export const translateBatch = async (texts, targetLanguage, sourceLanguage = 'auto') => {
  try {
    const translations = await Promise.all(
      texts.map(text => translateText(text, targetLanguage, sourceLanguage))
    );
    
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    throw new Error('Failed to translate texts');
  }
};