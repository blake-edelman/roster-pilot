import { afterEach, describe, expect, it, vi } from 'vitest';
import { retryDelay, SleeperDraftPoller } from './poller';

afterEach(() => vi.useRealTimers());

describe('SleeperDraftPoller', () => {
  it('backs off failures to a capped interval', () => {
    expect([1, 2, 3, 4, 5].map((attempt) => retryDelay(attempt))).toEqual([5_000, 10_000, 20_000, 30_000, 30_000]);
  });

  it('reports an error and retries after the backoff interval', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    const onError = vi.fn();
    const poller = new SleeperDraftPoller('draft-1', { onData: vi.fn(), onError }, fetcher, 100);

    poller.start();
    await vi.runOnlyPendingTimersAsync();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), 100);
    expect(fetcher).toHaveBeenCalled();
    poller.stop();
  });

  it('does not start overlapping polling loops', async () => {
    const fetcher = vi.fn().mockReturnValue(new Promise<Response>(() => undefined));
    const poller = new SleeperDraftPoller('draft-1', { onData: vi.fn(), onError: vi.fn() }, fetcher);
    poller.start();
    poller.start();
    await Promise.resolve();
    expect(fetcher).toHaveBeenCalledTimes(1);
    poller.stop();
  });
});

