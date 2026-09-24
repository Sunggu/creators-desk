import { describe, expect, it } from 'vitest';
import type { TailscaleStatusDto } from '../../domain/tailscale-status.dto';
import {
  getTailscaleStatus,
  toTailscaleStatusViewModel,
} from './get-tailscale-status';
import type { TailscaleStatusRepository } from '../ports/tailscale-status.repository';

const BASE_DTO: TailscaleStatusDto = {
  version: '1.102.4',
  backendState: 'Running',
  online: true,
  hostname: 'horuru',
  dnsName: 'horuru.ts.net',
  tailscaleIps: ['100.100.195.83'],
  checkedAt: '2026-09-24T00:00:00.000Z',
};

function repositoryReturning(dto: TailscaleStatusDto): TailscaleStatusRepository {
  return { getStatus: async () => dto };
}

describe('toTailscaleStatusViewModel', () => {
  it.each([
    ['Running', 'running'],
    ['NeedsLogin', 'needs-login'],
    ['NeedsMachineAuth', 'needs-login'],
    ['LoginStateToS', 'needs-login'],
    ['Starting', 'starting'],
    ['Stopped', 'stopped'],
    ['NoState', 'stopped'],
  ] as const)('maps backend state %s -> %s', (backendState, kind) => {
    const view = toTailscaleStatusViewModel({
      ...BASE_DTO,
      backendState,
    });
    expect(view.kind).toBe(kind);
  });

  it('passes through runtime details', () => {
    const view = toTailscaleStatusViewModel(BASE_DTO);
    expect(view).toMatchObject({
      version: BASE_DTO.version,
      online: true,
      hostname: 'horuru',
      dnsName: 'horuru.ts.net',
      tailscaleIps: ['100.100.195.83'],
      checkedAt: BASE_DTO.checkedAt,
    });
  });
});

describe('getTailscaleStatus', () => {
  it('resolves with the mapped view model', async () => {
    const view = await getTailscaleStatus(repositoryReturning(BASE_DTO));
    expect(view.kind).toBe('running');
  });

  it('returns unavailable when the repository fails', async () => {
    const failing: TailscaleStatusRepository = {
      getStatus: async () => {
        throw new Error('boom');
      },
    };
    const view = await getTailscaleStatus(failing);
    expect(view).toEqual({ kind: 'unavailable', tailscaleIps: [] });
  });
});