import { describe, expect, it } from 'vitest';
import {
  normalizeTailscaleCliOutput,
} from '../../server/tailscale-status.plugin.ts';

const VALID_CLI_OUTPUT = JSON.stringify({
  Version: '1.102.4',
  BackendState: 'Running',
  Self: {
    HostName: 'horuru',
    DNSName: 'horuru.ts.net.',
    Online: true,
    TailscaleIPs: ['100.100.195.83', 'fd7a::1'],
  },
});

describe('normalizeTailscaleCliOutput', () => {
  it('extracts core fields from tailscale status --json', () => {
    const payload = normalizeTailscaleCliOutput(VALID_CLI_OUTPUT);
    expect(payload).toMatchObject({
      version: '1.102.4',
      backendState: 'Running',
      online: true,
      hostname: 'horuru',
      dnsName: 'horuru.ts.net.',
      tailscaleIps: ['100.100.195.83', 'fd7a::1'],
    });
    expect(new Date(payload.checkedAt).toString()).not.toBe('Invalid Date');
  });

  it('falls back to empty defaults for missing fields', () => {
    const payload = normalizeTailscaleCliOutput('{}');
    expect(payload).toMatchObject({
      version: '',
      backendState: '',
      online: false,
      hostname: '',
      dnsName: '',
      tailscaleIps: [],
    });
  });

  it('surfaces JSON parse failures', () => {
    expect(() => normalizeTailscaleCliOutput('not-json')).toThrow();
  });
});