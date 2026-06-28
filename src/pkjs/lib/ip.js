"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

// Fetches the phone's *public* IP and, when reachable, its ISP. The LAN/local
// IP is not reachable from PebbleKit JS.
//
// Some phone networks (DNS-level ad/tracker blockers) reach OpenWeatherMap and
// ipify but block IP-geolocation hosts like ipwho.is / ipapi.co. So we try the
// ISP-capable providers first and fall back to ipify for an IP-only result —
// that way the IP always refreshes even if the ISP can't be resolved. Each
// branch logs so the phone's JS console reveals exactly what happened.
var fetchJSON = function fetchJSON(url, timeoutMs) {
  return new _promise.default(function (resolve) {
    var xhr = new XMLHttpRequest();
    var settled = false;

    var done = function done(value) {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    xhr.onload = function () {
      return done(xhr.responseText);
    };

    xhr.onerror = function () {
      return done(null);
    };

    xhr.ontimeout = function () {
      return done(null);
    };

    xhr.open('GET', url, true);
    xhr.timeout = timeoutMs;

    try {
      xhr.send();
    } catch (e) {
      done(null);
    }

    setTimeout(function () {
      return done(null);
    }, timeoutMs + 1000);
  });
};

var parse = function parse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}; // An IPv6 string (e.g. "2001:db8::1") is up to 39 chars and overflows the top
// row, overlapping the other status glyphs, so we only ever display IPv4. A
// colon means IPv6; a non-empty colon-free string is IPv4.


var isV4 = function isV4(ip) {
  return typeof ip === 'string' && ip.length > 0 && ip.indexOf(':') === -1;
};

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var a, isp, c, b;
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.t0 = parse;
          _context.next = 3;
          return fetchJSON('https://ipwho.is/', 8000);

        case 3:
          _context.t1 = _context.sent;
          a = (0, _context.t0)(_context.t1);
          isp = a && a.success && a.connection && a.connection.isp ? a.connection.isp : '';

          if (!(a && a.success && isV4(a.ip))) {
            _context.next = 9;
            break;
          }

          console.log("phone ipv4 via ipwho.is: ".concat(a.ip, " / ").concat(isp || '(no isp)'));
          return _context.abrupt("return", {
            ip: a.ip,
            isp: isp
          });

        case 9:
          _context.t2 = parse;
          _context.next = 12;
          return fetchJSON('https://api.ipify.org?format=json', 8000);

        case 12:
          _context.t3 = _context.sent;
          c = (0, _context.t2)(_context.t3);

          if (!(c && isV4(c.ip))) {
            _context.next = 17;
            break;
          }

          console.log("phone ipv4 via ipify: ".concat(c.ip, " / ").concat(isp || '(no isp)'));
          return _context.abrupt("return", {
            ip: c.ip,
            isp: isp
          });

        case 17:
          _context.t4 = parse;
          _context.next = 20;
          return fetchJSON('https://ipapi.co/json/', 8000);

        case 20:
          _context.t5 = _context.sent;
          b = (0, _context.t4)(_context.t5);

          if (!(b && isV4(b.ip))) {
            _context.next = 25;
            break;
          }

          console.log("phone ipv4 via ipapi.co: ".concat(b.ip));
          return _context.abrupt("return", {
            ip: b.ip,
            isp: isp || b.org || ''
          });

        case 25:
          if (!(a && a.ip || c && c.ip || b && b.ip)) {
            _context.next = 28;
            break;
          }

          console.log('phone ip: IPv6-only, showing "IPv6" marker');
          return _context.abrupt("return", {
            ip: 'IPv6',
            isp: isp
          });

        case 28:
          console.log('phone ip: all providers failed');
          return _context.abrupt("return", null);

        case 30:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));

exports.default = _default;
