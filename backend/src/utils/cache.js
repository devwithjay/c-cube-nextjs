const store = new Map();

function now() {
  return Date.now();
}

export function cacheGet(key) {
  const entry = store.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= now()) {
    store.delete(key);
    return undefined;
  }

  return entry.value;
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, {
    value,
    expiresAt: now() + Math.max(ttlMs, 1)
  });

  return value;
}

export async function cacheGetOrSet(key, ttlMs, loader) {
  const cached = cacheGet(key);

  if (cached !== undefined) {
    return cached;
  }

  const value = await loader();
  cacheSet(key, value, ttlMs);
  return value;
}

export function cacheInvalidate(prefix = "") {
  if (!prefix) {
    store.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export const CACHE_KEYS = {
  site: "site:public",
  publishedTest: "threeq:published-test"
};

export function testCacheKey(testId, version) {
  return `threeq:test:${testId}:${version}`;
}
