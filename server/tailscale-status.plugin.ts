import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

const execFileAsync = promisify(execFile)

export const TAILSCALE_STATUS_ENDPOINT = '/api/tailscale/status'

export interface TailscaleStatusPayload {
  version: string
  backendState: string
  online: boolean
  hostname: string
  dnsName: string
  tailscaleIps: string[]
  checkedAt: string
}

export function normalizeTailscaleCliOutput(raw: string): TailscaleStatusPayload {
  const parsed = JSON.parse(raw) as {
    Version?: string
    BackendState?: string
    Self?: {
      HostName?: string
      DNSName?: string
      Online?: boolean
      TailscaleIPs?: string[]
    }
  }

  return {
    version: parsed.Version ?? '',
    backendState: parsed.BackendState ?? '',
    online: parsed.Self?.Online ?? false,
    hostname: parsed.Self?.HostName ?? '',
    dnsName: parsed.Self?.DNSName ?? '',
    tailscaleIps: parsed.Self?.TailscaleIPs ?? [],
    checkedAt: new Date().toISOString(),
  }
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function tailscaleStatusPlugin(): Plugin {
  return {
    name: 'creators-desk:tailscale-status',
    configureServer(server) {
      server.middlewares.use(
        TAILSCALE_STATUS_ENDPOINT,
        async (_req: IncomingMessage, res: ServerResponse) => {
          try {
            const { stdout } = await execFileAsync('tailscale', ['status', '--json'], {
              timeout: 5000,
              maxBuffer: 1024 * 1024,
            })
            sendJson(res, 200, normalizeTailscaleCliOutput(stdout))
          } catch (error) {
            sendJson(res, 502, {
              message: error instanceof Error ? error.message : 'tailscale request failed',
            })
          }
        },
      )
    },
  }
}