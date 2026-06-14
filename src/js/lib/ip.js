import request from './request';

// Fetches the phone's *public* IP and its ISP in one call (ipwho.is, HTTPS, no
// key). The LAN/local IP is not reachable from PebbleKit JS. City is available
// too but intentionally not used.
export default async () => {
  const response = await request('https://ipwho.is/');
  try {
    const parsed = JSON.parse(response);
    if (parsed && parsed.success && parsed.ip) {
      return {
        ip: parsed.ip,
        isp: (parsed.connection && parsed.connection.isp) || '',
      };
    }
  } catch (e) {
    console.log(`phone ip parse error: ${e}`);
  }
  return null;
};
