// tests/timeoutretry.test.ts
import { WithTimeout, WithRetry, WithTimeoutAndRetry } from "./timeoutretry";

describe("WithTimeout", () => {
  test("should resolve if action completes before timeout", async () => {
    const result = await WithTimeout(() => Promise.resolve("success"), 1000);
    expect(result).toBe("success");
  });

  test("should reject if action does not complete before timeout", async () => {
    await expect(
      WithTimeout(
        () => new Promise((resolve) => setTimeout(() => resolve("slow"), 2000)),
        1000
      )
    ).rejects.toThrow("Action timed out");
  });
});

describe("WithRetry", () => {
  test("should resolve if action eventually succeeds", async () => {
    let attempts = 0;
    const action = () => {
      attempts++;
      return attempts >= 2
        ? Promise.resolve("success")
        : Promise.reject(new Error("fail"));
    };

    const result = await WithRetry(action, 3, 100);
    expect(result).toBe("success");
  });

  test("should reject if action never succeeds", async () => {
    const action = () => Promise.reject(new Error("fail"));
    await expect(WithRetry(action, 3, 100)).rejects.toThrow("fail");
  });
});

describe("WithTimeoutAndRetry", () => {
  test("should resolve if action completes before global timeout and after some retries", async () => {
    let attempts = 0;
    const action = () => {
      attempts++;
      return attempts >= 3
        ? Promise.resolve("success")
        : Promise.reject(new Error("fail"));
    };

    const result = await WithTimeoutAndRetry(action, {
      globalTimeoutMs: 5000,
      retries: { max: 5, timeoutMs: 100 },
    });
    expect(result).toBe("success");
  });

  test("should reject if action does not complete before global timeout", async () => {
    const action = () =>
      new Promise((resolve) => setTimeout(() => resolve("slow"), 2000));
    await expect(
      WithTimeoutAndRetry(action, {
        globalTimeoutMs: 1000,
        retries: { max: 3, timeoutMs: 100 },
      })
    ).rejects.toThrow("Action timed out");
  });
});
