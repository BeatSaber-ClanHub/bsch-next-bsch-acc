import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // Must be 32 characters for AES-256

// Decrypt
function decryptAPIKey(encryptedApiKey: string): string {
  const [encrypted, iv] = encryptedApiKey.split(".");
  const decrypted = CryptoJS.AES.decrypt(
    encrypted,
    CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export default decryptAPIKey;
