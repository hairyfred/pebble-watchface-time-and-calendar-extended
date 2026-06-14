import request from './request';

// Fetches the phone's *public* IP from a sandboxed-JS-friendly echo service.
// The LAN/local IP is not reachable from PebbleKit JS (no network-interface API).
export default async () => {
  const response = await request('https://api.ipify.org?format=json');
  try {
    const parsed = JSON.parse(response);
    if (parsed && parsed.ip) {
      return parsed.ip;
    }
  } catch (e) {
    console.log(`phone ip parse error: ${e}`);
  }
  return null;
};
