import CryptoJS from 'crypto-js';

/**
 * Generates a random 32-character hex key formatted like Java:
 * xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx
 * where x is random hex (0-f), and y is (8, 9, a, or b)
 */
export function generateRandomKey(): string {
  const pattern = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
  return pattern
    .split('')
    .map((c) => {
      if (c === 'x') {
        return Math.floor(Math.random() * 16).toString(16);
      }
      if (c === 'y') {
        return ((Math.floor(Math.random() * 4) + 8) & 0xb).toString(16);
      }
      return c;
    })
    .join('');
}

/**
 * Android Sakuna _signMd5 implementation:
 * 1. Remove 'signature' and 'timestamp'
 * 2. Sort keys alphabetically (TreeMap)
 * 3. JSON stringify without whitespace
 * 4. MD5 hash formatted as 32 lowercase or uppercase hex characters
 */
export function signMd5(params: Record<string, unknown>): string {
  const cleanMap: Record<string, unknown> = {};
  const keys = Object.keys(params)
    .filter((k) => k !== 'signature' && k !== 'timestamp')
    .sort();

  for (const k of keys) {
    cleanMap[k] = params[k];
  }

  const hashString = JSON.stringify(cleanMap).replace(/\s+/g, '');
  const md5Hex = CryptoJS.MD5(hashString).toString(CryptoJS.enc.Hex);
  return md5Hex.toUpperCase();
}
