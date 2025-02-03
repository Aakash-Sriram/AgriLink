interface RateLimitConfig {
  limit: number;
  interval: number;
  burstLimit?: number;
  burstInterval?: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private readonly stores: Map<string, number[]> = new Map();
  private readonly buckets: Map<string, TokenBucket> = new Map();
  private readonly config: Required<RateLimitConfig>;
  private readonly cleanupInterval: number = 60000; // 1 minute

  constructor(config: RateLimitConfig) {
    this.config = {
      limit: config.limit,
      interval: config.interval,
      burstLimit: config.burstLimit || config.limit * 2,
      burstInterval: config.burstInterval || config.interval / 2
    };

    this.setupCleanup();
  }

  tryAcquire(key: string = 'default'): boolean {
    return this.checkRateLimit(key) && this.checkBurstLimit(key);
  }

  private checkRateLimit(key: string): boolean {
    const now = Date.now();
    const timestamps = this.getTimestamps(key);
    
    // Remove expired timestamps
    const validTimestamps = timestamps.filter(
      time => now - time < this.config.interval
    );
    
    if (validTimestamps.length >= this.config.limit) {
      this.stores.set(key, validTimestamps);
      return false;
    }
    
    validTimestamps.push(now);
    this.stores.set(key, validTimestamps);
    return true;
  }

  private checkBurstLimit(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    
    if (!bucket) {
      bucket = { tokens: this.config.burstLimit, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const refillAmount = Math.floor(timePassed / this.config.burstInterval) 
      * this.config.burstLimit;
    
    bucket.tokens = Math.min(
      bucket.tokens + refillAmount,
      this.config.burstLimit
    );
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      return false;
    }

    bucket.tokens--;
    return true;
  }

  private getTimestamps(key: string): number[] {
    return this.stores.get(key) || [];
  }

  private setupCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Cleanup timestamps
      for (const [key, timestamps] of this.stores.entries()) {
        const validTimestamps = timestamps.filter(
          time => now - time < this.config.interval
        );
        
        if (validTimestamps.length === 0) {
          this.stores.delete(key);
        } else {
          this.stores.set(key, validTimestamps);
        }
      }

      // Cleanup buckets
      for (const [key, bucket] of this.buckets.entries()) {
        if (now - bucket.lastRefill > this.config.interval * 2) {
          this.buckets.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  getRemainingTokens(key: string = 'default'): number {
    const bucket = this.buckets.get(key);
    return bucket?.tokens || this.config.burstLimit;
  }

  getTimeUntilReset(key: string = 'default'): number {
    const timestamps = this.getTimestamps(key);
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = Math.min(...timestamps);
    return Math.max(0, this.config.interval - (Date.now() - oldestTimestamp));
  }
}