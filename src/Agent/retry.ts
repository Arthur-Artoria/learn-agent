import { APIError, APIConnectionError } from 'openai';

type AsyncFn<T extends unknown[], R> = (...args: T) => Promise<R>;

interface RetryOptions {
  maxRetries: number;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof APIError) {
    return error.status === 429 || error.status >= 500;
  }
  if (error instanceof APIConnectionError) {
    return true;
  }
  return false;
}

export const retry = <T extends unknown[], R>(
  fn: AsyncFn<T, R>,
  options: RetryOptions,
): AsyncFn<T, R> => {
  return async (...args: T) => {
    const { maxRetries } = options;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error: unknown) {
        lastError = error;
        if (!isRetryable(error) || attempt === maxRetries) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };
};
