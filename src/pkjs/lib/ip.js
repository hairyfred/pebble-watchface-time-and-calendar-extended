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
};

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var a, b, c;
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

          if (!(a && a.success && a.ip && a.connection && a.connection.isp)) {
            _context.next = 8;
            break;
          }

          console.log("phone ip via ipwho.is: ".concat(a.ip, " / ").concat(a.connection.isp));
          return _context.abrupt("return", {
            ip: a.ip,
            isp: a.connection.isp
          });

        case 8:
          _context.t2 = parse;
          _context.next = 11;
          return fetchJSON('https://ipapi.co/json/', 8000);

        case 11:
          _context.t3 = _context.sent;
          b = (0, _context.t2)(_context.t3);

          if (!(b && b.ip)) {
            _context.next = 16;
            break;
          }

          console.log("phone ip via ipapi.co: ".concat(b.ip, " / ").concat(b.org || '(no isp)'));
          return _context.abrupt("return", {
            ip: b.ip,
            isp: b.org || ''
          });

        case 16:
          _context.t4 = parse;
          _context.next = 19;
          return fetchJSON('https://api.ipify.org?format=json', 8000);

        case 19:
          _context.t5 = _context.sent;
          c = (0, _context.t4)(_context.t5);

          if (!(c && c.ip)) {
            _context.next = 24;
            break;
          }

          console.log("phone ip via ipify (no isp): ".concat(c.ip));
          return _context.abrupt("return", {
            ip: c.ip,
            isp: ''
          });

        case 24:
          if (!(a && a.success && a.ip)) {
            _context.next = 27;
            break;
          }

          console.log("phone ip via ipwho.is (no isp): ".concat(a.ip));
          return _context.abrupt("return", {
            ip: a.ip,
            isp: ''
          });

        case 27:
          console.log('phone ip: all providers failed');
          return _context.abrupt("return", null);

        case 29:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));

exports.default = _default;