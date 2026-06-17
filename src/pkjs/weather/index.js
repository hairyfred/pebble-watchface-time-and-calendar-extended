"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _providers = _interopRequireDefault(require("./providers"));

var _request = _interopRequireDefault(require("../lib/request"));

var _pebbleWeatherObject = _interopRequireDefault(require("./pebbleWeatherObject"));

var _weatherAttributeTables = require("./weatherAttributeTables");

// TODO: check for malformed and empty response from weather provider
var _default =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(options) {
    var provider, _ref2, errors, url, weatherResponse, weatherPOJO, code, weatherObj;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            provider = (0, _providers.default)(options.provider);

            if (provider) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.weather_disabled
            }));

          case 3:
            if (!(options.apiKey === 'not_set' || options.apiKey === '')) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.api_key_not_set
            }));

          case 5:
            if (!(options.apiKey === 'invalid')) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.api_key_invalid
            }));

          case 7:
            _context.next = 9;
            return provider.makeUrl(options);

          case 9:
            _ref2 = _context.sent;
            errors = _ref2.errors;
            url = _ref2.url;

            if (!errors.message) {
              _context.next = 15;
              break;
            }

            console.log("makeUrl: ".concat(errors.message));
            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.location_error
            }, options.type));

          case 15:
            _context.prev = 15;
            _context.next = 18;
            return (0, _request.default)(url);

          case 18:
            weatherResponse = _context.sent;
            _context.next = 24;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context["catch"](15);
            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.unknown_error
            }, options.type));

          case 24:
            _context.prev = 24;
            weatherPOJO = JSON.parse(weatherResponse);
            _context.next = 31;
            break;

          case 28:
            _context.prev = 28;
            _context.t1 = _context["catch"](24);
            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.unknown_error
            }, options.type));

          case 31:
            code = String(weatherPOJO.cod);

            if (!(code === '401')) {
              _context.next = 34;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.api_key_invalid
            }));

          case 34:
            if (!(code === '400')) {
              _context.next = 36;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.invalid_location_id
            }));

          case 36:
            if (!(code === '429')) {
              _context.next = 38;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.banned
            }));

          case 38:
            if (!(code !== '200')) {
              _context.next = 40;
              break;
            }

            return _context.abrupt("return", (0, _pebbleWeatherObject.default)({
              WeatherError: _weatherAttributeTables.messages.unknown_error
            }, options.type));

          case 40:
            weatherObj = provider.makeWeatherObj(options, weatherPOJO);
            return _context.abrupt("return", (0, _pebbleWeatherObject.default)(weatherObj, options.type));

          case 42:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[15, 21], [24, 28]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = _default;