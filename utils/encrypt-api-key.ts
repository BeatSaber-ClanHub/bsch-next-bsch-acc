import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // Must be 32 characters for AES-256
const IV = CryptoJS.lib.WordArray.random(16); // Generate a random 16-byte IV

// Encrypt
function encryptAPIKey(apiKey: string): string {
  const encrypted = CryptoJS.AES.encrypt(
    apiKey,
    CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
    {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return `${encrypted.toString()}.${IV.toString(CryptoJS.enc.Hex)}`; // Concatenate encrypted data and IV
}

export default encryptAPIKey;
