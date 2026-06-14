// Fetches the phone's *public* IP and its ISP. The LAN/local IP is not
// reachable from PebbleKit JS. Uses its own XHR with a generous timeout (the
// shared request helper's 2s timeout is too tight for a cold mobile request),
// and falls back to a second provider so the ISP is filled in even if the
// primary omits it. City is available but intentionally not used.

const fetchJSON = (url, timeoutMs) => new Promise((resolve) => {
  const xhr = new XMLHttpRequest();
  let settled = false;
  const done = (value) => { if (!settled) { settled = true; resolve(value); } };
  xhr.onload = () => done(xhr.responseText);
  xhr.onerror = () => done(null);
  xhr.ontimeout = () => done(null);
  xhr.open('GET', url, true);
  xhr.timeout = timeoutMs;
  try {
    xhr.send();
  } catch (e) {
    done(null);
  }
  setTimeout(() => done(null), timeoutMs + 1000);
});

const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

export default async () => {
  // Primary: ipwho.is returns IP + ISP in one HTTPS call.
  const primary = parse(await fetchJSON('https://ipwho.is/', 8000));
  if (primary && primary.success && primary.ip) {
    const isp = (primary.connection && primary.connection.isp) || '';
    if (isp) {
      return { ip: primary.ip, isp };
    }
    // Got the IP but no ISP — enrich from the fallback, keep this IP.
    const enrich = parse(await fetchJSON('https://ipapi.co/json/', 8000));
    return { ip: primary.ip, isp: (enrich && enrich.org) || '' };
  }

  // Fallback provider: ipapi.co (its "org" field is the ISP).
  const fallback = parse(await fetchJSON('https://ipapi.co/json/', 8000));
  if (fallback && fallback.ip) {
    return { ip: fallback.ip, isp: fallback.org || '' };
  }

  return null;
};
