// src/timeoutretry.ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function WithTimeout<T>(
  action: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Action timed out"));
    }, timeoutMs);

    try {
      const result = await action();
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

export async function WithRetry<T>(
  action: () => Promise<T>,
  maxRetries: number,
  retryTimeoutMs: number
): Promise<T> {
  let lastError = new Error("Action failed");

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      await delay(retryTimeoutMs);
    }
  }

  throw lastError;
}

export async function WithTimeoutAndRetry<T>(
  action: () => Promise<T>,
  options: {
    globalTimeoutMs: number;
    retries: {
      max: number;
      timeoutMs: number;
    };
  }
): Promise<T> {
  return WithTimeout(
    () => WithRetry(action, options.retries.max, options.retries.timeoutMs),
    options.globalTimeoutMs
  );
}
