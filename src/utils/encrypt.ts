import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

const encryptJSON = <T>(jsonData: T): string => {
  const jsonString = JSON.stringify(jsonData);
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();

  return encrypted;
};

const decryptJSON = <T>(encryptedString: string): T => {
  const bytes = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

  return JSON.parse(decryptedString) as T;
};

export { encryptJSON, decryptJSON };
