export async function WithTimeoutAndRetry<T>(
  action: () => Promise<T>,
  timeoutMs: number,
  maxRetries: number
): Promise<T> {
  async function timeout(): Promise<T> {
    return new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error("timeout"));
      }, timeoutMs);
    });
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await Promise.race([action(), timeout()]);
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed: ${error}`);
      lastError = error as Error;
    }
  }

  throw lastError || new Error("Failed after retrying maximum times");
}
