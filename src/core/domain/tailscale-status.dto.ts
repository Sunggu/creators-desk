export interface TailscaleStatusDto {
  version: string;
  backendState: string;
  online: boolean;
  hostname: string;
  dnsName: string;
  tailscaleIps: string[];
  checkedAt: string;
}