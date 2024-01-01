import { sleep } from "./util";
import { capture } from "./capture";

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_INITIAL_BACKOFF_MS = 1000;
const DEFAULT_MAX_BACKOFF_MS = 10000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAxiosNetworkError = (err: any) => err.code && err.code.includes("ERR_NETWORK");

export async function retryWithExponentialBackoff<T>(
  functionToRetry: () => Promise<T>,
  context: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldRetry: (err: any) => boolean,
  max_retries: number = DEFAULT_MAX_RETRIES,
  initial_backoff_ms: number = DEFAULT_INITIAL_BACKOFF_MS,
  max_backoff_ms: number = DEFAULT_MAX_BACKOFF_MS
): Promise<T> {
  let failedRetries = 0;
  let backoffMs = initial_backoff_ms;

  while (failedRetries < max_retries) {
    try {
      return await functionToRetry();
    } catch (err) {
      failedRetries++;

      if (failedRetries >= max_retries) {
        capture.error(err, {
          extra: { context: `${context}.maxRetriesReached`, err, functionToRetry },
        });
        throw err;
      }
      if (shouldRetry(err)) {
        await sleep(backoffMs);
        backoffMs = Math.min(backoffMs * 2, max_backoff_ms);
      } else {
        capture.error(err, { extra: { context, err, functionToRetry } });
        throw err;
      }
    }
  }

  // The while loop should always be engaged when this function is called and it should be self-sufficient in making a return for this function
  capture.error(`Unreachable code`, {
    extra: { context: `${context}.retry.unreachable`, failedRetries, functionToRetry },
  });
  throw new Error(`Unreachable code`);
}
