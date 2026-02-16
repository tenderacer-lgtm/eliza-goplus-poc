class RateLimiter {
  private userRequests: Map<number, number[]>;
  private windowMs: number;
  private maxRequests: number;

  constructor() {
    this.userRequests = new Map();
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
  }

  async checkLimit(userId: number): Promise<boolean> {
    const now = Date.now();
    const userHistory = this.userRequests.get(userId) || [];
    
    const recentRequests = userHistory.filter(ts => now - ts < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.userRequests.set(userId, recentRequests);
    return true;
  }

  getRemainingTime(userId: number): number {
    const userHistory = this.userRequests.get(userId) || [];
    if (userHistory.length === 0) return 0;
    
    const oldestRequest = Math.min(...userHistory);
    const timeRemaining = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, Math.ceil(timeRemaining / 1000));
  }
}

export { RateLimiter };
