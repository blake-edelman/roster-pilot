import { loadSleeperDraft } from '../adapters/sleeper';
import type { DraftBundle } from '../adapters/sleeper';

export interface PollerCallbacks {
  onData: (bundle: DraftBundle) => void;
  onError: (error: Error, nextRetryMs: number) => void;
}

export function retryDelay(failureCount: number, baseDelayMs = 5_000, maximumDelayMs = 30_000): number {
  return Math.min(maximumDelayMs, baseDelayMs * 2 ** Math.max(0, failureCount - 1));
}

export class SleeperDraftPoller {
  private stopped = true;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private failures = 0;

  constructor(
    private readonly draftId: string,
    private readonly callbacks: PollerCallbacks,
    private readonly fetcher: typeof fetch = fetch,
    private readonly baseDelayMs = 5_000,
  ) {}

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    void this.poll();
  }

  stop(): void {
    this.stopped = true;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
  }

  private schedule(delay: number): void {
    if (this.stopped) return;
    this.timeout = setTimeout(() => void this.poll(), delay);
  }

  private async poll(): Promise<void> {
    if (this.stopped) return;
    try {
      const bundle = await loadSleeperDraft(this.draftId, this.fetcher);
      if (this.stopped) return;
      this.failures = 0;
      this.callbacks.onData(bundle);
      this.schedule(this.baseDelayMs);
    } catch (error) {
      if (this.stopped) return;
      this.failures += 1;
      const delay = retryDelay(this.failures, this.baseDelayMs);
      this.callbacks.onError(error instanceof Error ? error : new Error('Unknown Sleeper error'), delay);
      this.schedule(delay);
    }
  }
}

