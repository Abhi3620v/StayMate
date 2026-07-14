const store = new Map();
let hits = 0;
let misses = 0;

export const cacheService = {
  /**
   * Retrive a value from the cache
   * @param {string} key 
   * @returns {*} value or null
   */
  get: (key) => {
    const entry = store.get(key);
    if (!entry) {
      misses++;
      return null;
    }

    // Check if TTL has expired
    if (entry.expiry && entry.expiry < Date.now()) {
      store.delete(key);
      misses++;
      return null;
    }

    hits++;
    return entry.value;
  },

  /**
   * Store a value in the cache with a specified TTL (in seconds)
   * @param {string} key 
   * @param {*} value 
   * @param {number} ttlInSeconds 
   */
  set: (key, value, ttlInSeconds = 300) => {
    const expiry = ttlInSeconds > 0 ? Date.now() + (ttlInSeconds * 1000) : null;
    store.set(key, { value, expiry });
  },

  /**
   * Delete an item from the cache
   * @param {string} key 
   */
  del: (key) => {
    return store.delete(key);
  },

  /**
   * Invalidate multiple keys matching a pattern/prefix (e.g. "properties:")
   * @param {string} pattern 
   */
  invalidatePattern: (pattern) => {
    let count = 0;
    for (const key of store.keys()) {
      if (key.startsWith(pattern)) {
        store.delete(key);
        count++;
      }
    }
    return count;
  },

  /**
   * Clear the entire cache
   */
  clear: () => {
    store.clear();
    hits = 0;
    misses = 0;
  },

  /**
   * Retrieve hit rate and memory size diagnostics
   */
  getStats: () => {
    const totalRequests = hits + misses;
    const hitRate = totalRequests > 0 ? Math.round((hits / totalRequests) * 100) : 0;
    
    // Prune expired entries to maintain an accurate sizing check
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.expiry && entry.expiry < now) {
        store.delete(key);
      }
    }

    return {
      size: store.size,
      hits,
      misses,
      hitRate,
    };
  }
};

export default cacheService;
