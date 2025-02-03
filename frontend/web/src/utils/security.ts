import { AES, enc } from 'crypto-js';
import DOMPurify from 'dompurify';

export class SecurityUtils {
  private static readonly STORAGE_KEY = 'AGRILINK_SECURE_STORAGE';
  private static readonly SECRET = process.env.REACT_APP_ENCRYPTION_KEY;

  private static validateEncryptionKey(): void {
    if (!this.SECRET || this.SECRET.length < 32) {
      throw new Error('Invalid encryption key configuration');
    }
  }

  static encryptData(data: any): string {
    this.validateEncryptionKey();
    if (!data) throw new Error('Invalid data for encryption');
    
    try {
      return AES.encrypt(JSON.stringify(data), this.SECRET).toString();
    } catch {
      throw new Error('Encryption failed');
    }
  }

  static decryptData(encryptedData: string): any {
    this.validateEncryptionKey();
    if (!encryptedData) throw new Error('Invalid encrypted data');
    
    try {
      const bytes = AES.decrypt(encryptedData, this.SECRET);
      const decrypted = bytes.toString(enc.Utf8);
      if (!decrypted) throw new Error('Decryption resulted in empty data');
      return JSON.parse(decrypted);
    } catch {
      throw new Error('Decryption failed');
    }
  }

  static secureStore(key: string, value: any): void {
    if (!key || typeof key !== 'string') throw new Error('Invalid storage key');
    try {
      const encryptedData = this.encryptData({ [key]: value });
      localStorage.setItem(`${this.STORAGE_KEY}_${key}`, encryptedData);
    } catch {
      // Clear potentially corrupted data
      localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
      throw new Error('Secure storage operation failed');
    }
  }

  static secureRetrieve(key: string): any {
    if (!key || typeof key !== 'string') throw new Error('Invalid storage key');
    try {
      const encryptedData = localStorage.getItem(`${this.STORAGE_KEY}_${key}`);
      if (!encryptedData) return null;
      const decryptedData = this.decryptData(encryptedData);
      return decryptedData?.[key] ?? null;
    } catch {
      // Clear potentially corrupted data
      localStorage.removeItem(`${this.STORAGE_KEY}_${key}`);
      return null;
    }
  }

  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    });
  }

  static validateInput(input: string, pattern: RegExp): boolean {
    if (typeof input !== 'string') return false;
    if (!(pattern instanceof RegExp)) return false;
    return pattern.test(input);
  }

  static clearSecureStorage(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }
}