import { z } from 'zod';
import DOMPurify from 'dompurify';

// Common validation patterns
const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  URL: /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/,
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  IPFS_HASH: /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\-_.,!?@()]+$/
};

// Zod schemas for complex type validation
const AnalyticsDataSchema = z.object({
  date: z.string().datetime(),
  price: z.number().positive(),
  volume: z.number().nonnegative(),
  revenue: z.number().nonnegative(),
  category: z.string().min(1)
});

export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;

export class ValidationUtils {
  static validateAnalyticsInput(data: unknown): boolean {
    if (!Array.isArray(data)) return false;
    try {
      z.array(AnalyticsDataSchema).parse(data);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeInput(input: string, allowHtml = false): string {
    if (typeof input !== 'string') return '';
    
    if (allowHtml) {
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
      });
    }
    
    return input.replace(/[<>'"]/g, '');
  }

  static validateEmail(email: string): boolean {
    return PATTERNS.EMAIL.test(email);
  }

  static validatePassword(password: string): boolean {
    return PATTERNS.PASSWORD.test(password);
  }

  static validatePhone(phone: string): boolean {
    return PATTERNS.PHONE.test(phone);
  }

  static validateUrl(url: string): boolean {
    return PATTERNS.URL.test(url);
  }

  static validateEthereumAddress(address: string): boolean {
    return PATTERNS.ETHEREUM_ADDRESS.test(address);
  }

  static validateIpfsHash(hash: string): boolean {
    return PATTERNS.IPFS_HASH.test(hash);
  }

  static validateSafeString(str: string): boolean {
    return PATTERNS.SAFE_STRING.test(str);
  }

  static validateObject<T>(data: unknown, schema: z.ZodType<T>): data is T {
    try {
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    allowHtmlFields: Array<keyof T> = []
  ): T {
    const sanitized = { ...obj };
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(
          value,
          allowHtmlFields.includes(key as keyof T)
        ) as unknown;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(
          value as Record<string, unknown>,
          allowHtmlFields
        );
      }
    }
    return sanitized;
  }

  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  static validateFileSize(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes;
  }

  static validateDateRange(start: Date, end: Date, maxRange?: number): boolean {
    if (start > end) return false;
    if (maxRange) {
      const range = end.getTime() - start.getTime();
      return range <= maxRange;
    }
    return true;
  }
}

// Export common schemas for reuse
export const Schemas = {
  Analytics: AnalyticsDataSchema,
  Email: z.string().regex(PATTERNS.EMAIL),
  Password: z.string().regex(PATTERNS.PASSWORD),
  Phone: z.string().regex(PATTERNS.PHONE),
  Url: z.string().regex(PATTERNS.URL),
  EthereumAddress: z.string().regex(PATTERNS.ETHEREUM_ADDRESS),
  IpfsHash: z.string().regex(PATTERNS.IPFS_HASH),
  SafeString: z.string().regex(PATTERNS.SAFE_STRING)
};