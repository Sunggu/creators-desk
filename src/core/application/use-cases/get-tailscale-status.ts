import type { TailscaleStatusDto } from '../../domain/tailscale-status.dto';
import type { TailscaleStatusRepository } from '../ports/tailscale-status.repository';

export type TailscaleStatusKind =
  | 'running'
  | 'needs-login'
  | 'starting'
  | 'stopped'
  | 'unavailable';

export interface TailscaleStatusViewModel {
  kind: TailscaleStatusKind;
  version?: string;
  online?: boolean;
  hostname?: string;
  dnsName?: string;
  tailscaleIps: string[];
  checkedAt?: string;
}

const RUNNING_STATES = new Set(['Running']);
const LOGIN_REQUIRED_STATES = new Set([
  'NeedsLogin',
  'NeedsMachineAuth',
  'LoginStateToS',
]);

function categorizeState(
  backendState: string,
): Exclude<TailscaleStatusKind, 'unavailable'> {
  if (RUNNING_STATES.has(backendState)) return 'running';
  if (LOGIN_REQUIRED_STATES.has(backendState)) return 'needs-login';
  if (backendState === 'Starting') return 'starting';
  return 'stopped';
}

export function toTailscaleStatusViewModel(
  dto: TailscaleStatusDto,
): TailscaleStatusViewModel {
  return {
    kind: categorizeState(dto.backendState),
    version: dto.version,
    online: dto.online,
    hostname: dto.hostname,
    dnsName: dto.dnsName,
    tailscaleIps: dto.tailscaleIps,
    checkedAt: dto.checkedAt,
  };
}

export async function getTailscaleStatus(
  repository: TailscaleStatusRepository,
): Promise<TailscaleStatusViewModel> {
  try {
    return toTailscaleStatusViewModel(await repository.getStatus());
  } catch {
    return { kind: 'unavailable', tailscaleIps: [] };
  }
}