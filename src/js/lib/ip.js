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

// An IPv6 string (e.g. "2001:db8::1") is up to 39 chars and overflows the top
// row, overlapping the other status glyphs, so we only ever display IPv4. A
// colon means IPv6; a non-empty colon-free string is IPv4.
const isV4 = (ip) => typeof ip === 'string' && ip.length > 0 && ip.indexOf(':') === -1;

export default async () => {
  // Hunt for an IPv4 address from whichever provider yields one; the ISP comes
  // from ipwho.is when reachable. If the phone is genuinely IPv6-only (no
  // provider returns a v4), show the short marker "IPv6" instead of an address
  // that cannot fit the row.

  // 1) ipwho.is — IP + ISP in one call. Use its IP only if it came back as v4.
  const a = parse(await fetchJSON('https://ipwho.is/', 8000));
  const isp = (a && a.success && a.connection && a.connection.isp) ? a.connection.isp : '';
  if (a && a.success && isV4(a.ip)) {
    console.log(`phone ipv4 via ipwho.is: ${a.ip} / ${isp || '(no isp)'}`);
    return { ip: a.ip, isp };
  }

  // 2) api.ipify.org has only an IPv4 (A) record, so the request is forced over
  //    IPv4 and returns the phone's v4 address whenever it has one — even on a
  //    dual-stack phone where ipwho.is above answered over IPv6.
  const c = parse(await fetchJSON('https://api.ipify.org?format=json', 8000));
  if (c && isV4(c.ip)) {
    console.log(`phone ipv4 via ipify: ${c.ip} / ${isp || '(no isp)'}`);
    return { ip: c.ip, isp };
  }

  // 3) ipapi.co — last try for a v4 (and an ISP if we still lack one).
  const b = parse(await fetchJSON('https://ipapi.co/json/', 8000));
  if (b && isV4(b.ip)) {
    console.log(`phone ipv4 via ipapi.co: ${b.ip}`);
    return { ip: b.ip, isp: isp || b.org || '' };
  }

  // 4) A provider answered, but only with IPv6 — the phone has no public v4.
  //    Show the short marker rather than an unfittable 39-char address.
  if ((a && a.ip) || (c && c.ip) || (b && b.ip)) {
    console.log('phone ip: IPv6-only, showing "IPv6" marker');
    return { ip: 'IPv6', isp };
  }

  console.log('phone ip: all providers failed');
  return null;
};
