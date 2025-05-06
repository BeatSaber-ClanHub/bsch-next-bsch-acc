import CryptoJS from "crypto-js";

const hashAPIKey = (key: string): string => {
  const hash = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex);
  return hash;
};

export default hashAPIKey;
