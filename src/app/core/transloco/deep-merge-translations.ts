import { Translation } from '@ngneat/transloco';

/**
 * Combina en profundidad dos objetos de traducción (objetos planos o anidados).
 */
export function deepMergeTranslations(target: Translation, source: Translation): Translation {
  const output: Translation = { ...target };

  if (isTranslationObject(target) && isTranslationObject(source)) {
    Object.keys(source).forEach((key) => {
      const srcVal = source[key];
      if (isTranslationObject(srcVal)) {
        if (!(key in target)) {
          Object.assign(output, { [key]: srcVal });
        } else {
          output[key] = deepMergeTranslations(target[key] as Translation, srcVal as Translation);
        }
      } else {
        Object.assign(output, { [key]: srcVal });
      }
    });
  }

  return output;
}

function isTranslationObject(item: unknown): item is Translation {
  return !!item && typeof item === 'object' && !Array.isArray(item);
}
