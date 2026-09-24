import type { TailscaleStatusDto } from '../../core/domain/tailscale-status.dto';
import type { TailscaleStatusRepository } from '../../core/application/ports/tailscale-status.repository';

const DEFAULT_ENDPOINT = '/api/tailscale/status';
const REQUEST_TIMEOUT_MS = 5000;

export class HttpTailscaleStatusRepository implements TailscaleStatusRepository {
  private readonly endpoint: string;

  constructor(endpoint: string = DEFAULT_ENDPOINT) {
    this.endpoint = endpoint;
  }

  async getStatus(): Promise<TailscaleStatusDto> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(this.endpoint, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(
          `tailscale status request failed with status ${response.status}`,
        );
      }
      return (await response.json()) as TailscaleStatusDto;
    } finally {
      clearTimeout(timer);
    }
  }
}