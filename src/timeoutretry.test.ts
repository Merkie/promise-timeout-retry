// src/timeoutretry.test.ts
import { WithTimeoutAndRetry } from "./timeoutretry";

describe("WithTimeoutAndRetry", () => {
  test("should resolve if action succeeds", async () => {
    const mockAction = jest.fn().mockResolvedValue("success");
    const result = await WithTimeoutAndRetry(mockAction, 1000, 3);
    expect(result).toBe("success");
  });

  test("should retry on failure and eventually succeed", async () => {
    const mockAction = jest
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");
    const result = await WithTimeoutAndRetry(mockAction, 1000, 3);
    expect(result).toBe("success");
    expect(mockAction).toHaveBeenCalledTimes(2);
  });

  test("should throw after max retries", async () => {
    const mockAction = jest.fn().mockRejectedValue(new Error("fail"));
    await expect(WithTimeoutAndRetry(mockAction, 1000, 3)).rejects.toThrow(
      "fail"
    );
    expect(mockAction).toHaveBeenCalledTimes(3);
  });
});
