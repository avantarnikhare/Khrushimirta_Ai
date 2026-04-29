type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __krushiRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalForRateLimit.__krushiRateLimitStore ??
  (globalForRateLimit.__krushiRateLimitStore = new Map());

function cleanRateLimitStore(now: number) {
  // Keep memory bounded on long-lived instances.
  if (rateLimitStore.size < 4000) {
    return;
  }

  rateLimitStore.forEach((value, key) => {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  });
}

function sanitizeIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9:._-]/g, "").slice(0, 120);
}

export function getClientIp(request: Request): string {
  const directHeaders = [
    request.headers.get("x-forwarded-for"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
  ];

  for (const headerValue of directHeaders) {
    if (!headerValue) {
      continue;
    }

    const candidate = headerValue.split(",")[0]?.trim();
    if (candidate) {
      return sanitizeIdentifier(candidate);
    }
  }

  const forwarded = request.headers.get("forwarded");
  if (forwarded) {
    const match = forwarded.match(/for=([^;]+)/i);
    if (match?.[1]) {
      return sanitizeIdentifier(match[1].replace(/"/g, "").trim());
    }
  }

  return "anonymous";
}

export function applyRateLimit(
  scope: string,
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  cleanRateLimitStore(now);

  const scopedKey = `${sanitizeIdentifier(scope)}:${sanitizeIdentifier(identifier)}`;

  const existing = rateLimitStore.get(scopedKey);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(scopedKey, { count: 1, resetAt });

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - 1),
      retryAfterSeconds: 0,
      resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(scopedKey, existing);

  const allowed = existing.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - existing.count);
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed,
    limit: config.maxRequests,
    remaining,
    retryAfterSeconds,
    resetAt: existing.resetAt,
  };
}

export function appendRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult,
) {
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.floor(result.resetAt / 1000)));

  if (!result.allowed) {
    headers.set("Retry-After", String(result.retryAfterSeconds));
  }
}
