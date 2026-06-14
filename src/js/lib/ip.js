// Fetches the phone's *public* IP and, when reachable, its ISP. The LAN/local
// IP is not reachable from PebbleKit JS.
//
// Some phone networks (DNS-level ad/tracker blockers) reach OpenWeatherMap and
// ipify but block IP-geolocation hosts like ipwho.is / ipapi.co. So we try the
// ISP-capable providers first and fall back to ipify for an IP-only result —
// that way the IP always refreshes even if the ISP can't be resolved. Each
// branch logs so the phone's JS console reveals exactly what happened.

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
  // 1) ipwho.is — IP + ISP in one call.
  const a = parse(await fetchJSON('https://ipwho.is/', 8000));
  if (a && a.success && a.ip && a.connection && a.connection.isp) {
    console.log(`phone ip via ipwho.is: ${a.ip} / ${a.connection.isp}`);
    return { ip: a.ip, isp: a.connection.isp };
  }

  // 2) ipapi.co — IP + org (its ISP field).
  const b = parse(await fetchJSON('https://ipapi.co/json/', 8000));
  if (b && b.ip) {
    console.log(`phone ip via ipapi.co: ${b.ip} / ${b.org || '(no isp)'}`);
    return { ip: b.ip, isp: b.org || '' };
  }

  // 3) ipify — IP only, but the most widely reachable. Better than nothing.
  const c = parse(await fetchJSON('https://api.ipify.org?format=json', 8000));
  if (c && c.ip) {
    console.log(`phone ip via ipify (no isp): ${c.ip}`);
    return { ip: c.ip, isp: '' };
  }

  // 4) ipwho.is gave an IP but no ISP earlier — still use the IP.
  if (a && a.success && a.ip) {
    console.log(`phone ip via ipwho.is (no isp): ${a.ip}`);
    return { ip: a.ip, isp: '' };
  }

  console.log('phone ip: all providers failed');
  return null;
};
