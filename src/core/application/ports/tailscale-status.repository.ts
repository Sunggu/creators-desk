import type { TailscaleStatusDto } from '../../domain/tailscale-status.dto';

export interface TailscaleStatusRepository {
  getStatus(): Promise<TailscaleStatusDto>;
}