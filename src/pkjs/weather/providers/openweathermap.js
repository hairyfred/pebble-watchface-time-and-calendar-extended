"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeWeatherObj = exports.makeUrl = void 0;

var _set = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/set"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _dateFns = _interopRequireDefault(require("date-fns"));

var _geopositionCached = _interopRequireDefault(require("../../lib/geoposition-cached"));

var _time = require("../../lib/time");

var getLocalTimeStamp = function getLocalTimeStamp() {
  return Math.round(new Date().getTime() / 1000) - (0, _time.getTZOffestInSeconds)();
};

var getLocation =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(options) {
    var errors, location, pos, _location;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            errors = {};

            if (!(options.locationType === 'cid')) {
              _context.next = 7;
              break;
            }

            if (!(options.cityId === 'not_set' || options.cityId === 'invalid_id')) {
              _context.next = 5;
              break;
            }

            errors.message = 'City ID Error';
            return _context.abrupt("return", {
              errors: errors
            });

          case 5:
            location = "?id=".concat(options.cityId);
            return _context.abrupt("return", {
              errors: errors,
              location: location
            });

          case 7:
            _context.prev = 7;
            _context.next = 10;
            return (0, _geopositionCached.default)();

          case 10:
            pos = _context.sent;
            _location = "?lat=".concat(pos.coords.latitude, "&lon=").concat(pos.coords.longitude);
            return _context.abrupt("return", {
              errors: errors,
              location: _location
            });

          case 15:
            _context.prev = 15;
            _context.t0 = _context["catch"](7);
            errors.message = 'GPS Location Error';
            return _context.abrupt("return", {
              errors: errors
            });

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[7, 15]]);
  }));

  return function getLocation(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getTemperatureUnits = function getTemperatureUnits(unitsKey) {
  switch (unitsKey) {
    case 'imperial':
      return '&units=imperial';

    case 'metric':
      return '&units=metric';

    case 'default':
      return '';

    default:
      return '';
  }
};

var makeUrl =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(options) {
    var addr, requestType, _ref3, errors, location, temperatureUnits, key, urlParts;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            addr = 'http://api.openweathermap.org/data/2.5/';
            requestType = options.type;
            _context2.next = 4;
            return getLocation(options);

          case 4:
            _ref3 = _context2.sent;
            errors = _ref3.errors;
            location = _ref3.location;
            // console.log(`location errer: ${errors.message}`);
            temperatureUnits = getTemperatureUnits(options.units);
            key = "&appid=".concat(options.apiKey);
            urlParts = [addr, requestType, location, temperatureUnits, key];
            return _context2.abrupt("return", {
              errors: errors,
              url: urlParts.join('')
            });

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function makeUrl(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.makeUrl = makeUrl;

var makeWeather = function makeWeather(weather) {
  return {
    temperature: Math.round(weather.main.temp),
    condition: weather.weather[0].id,
    // desc: weather.weather[0].description,
    timeStamp: getLocalTimeStamp(),
    pressure: Math.round(weather.main.pressure * 0.75) - 14,
    windSpeed: weather.wind.speed,
    windDirection: weather.wind.deg,
    humidity: weather.main.humidity,
    sunrise: (0, _time.getLocalTimeStampFromUtc)(weather.sys.sunrise * 1000),
    sunset: (0, _time.getLocalTimeStampFromUtc)(weather.sys.sunset * 1000)
  };
};

var getForecastItems = function getForecastItems(forecastType) {
  switch (forecastType) {
    case 'ft_off':
      return [];

    case 'ft_3h':
      return [0, 1, 2, 3, 4];

    case 'ft_6h':
      return [0, 2, 4, 6, 8];

    default:
      return [0, 1, 2, 3, 4];
  }
}; // Aggregate the 5-day / 3-hour list into upcoming whole-day summaries. dateFns
// formats UTC ms in the runtime's local timezone, so day boundaries and labels
// are local. Bucket 0 is "today" (partial) and is skipped so each day is whole.


var makeDailyForecast = function makeDailyForecast(weather) {
  var buckets = {};
  weather.list.forEach(function (item) {
    var ms = item.dt * 1000;

    var key = _dateFns.default.format(ms, 'YYYY-MM-DD');

    if (!buckets[key]) {
      buckets[key] = [];
    }

    buckets[key].push(item);
  });
  return (0, _keys.default)(buckets).sort().slice(1, 6).map(function (key) {
    var items = buckets[key];
    var high = Math.round(Math.max.apply(null, items.map(function (it) {
      return it.main.temp;
    }))); // representative condition: the entry closest to local 13:00

    var rep = items[0];
    var bestDist = 99;
    items.forEach(function (it) {
      var dist = Math.abs(new Date(it.dt * 1000).getHours() - 13);

      if (dist < bestDist) {
        bestDist = dist;
        rep = it;
      }
    });
    return {
      dayLabel: _dateFns.default.format(rep.dt * 1000, 'ddd'),
      temperature: high,
      condition: rep.weather[0].id,
      midTimeStamp: rep.dt * 1000
    };
  });
};

var makeForecast = function makeForecast(weather, forecastType) {
  var forecastItems = new _set.default(getForecastItems(forecastType));
  var hourly = weather.list.filter(function (_, index) {
    return forecastItems.has(index);
  }).map(function (item) {
    return {
      timeStamp: item.dt,
      temperature: Math.round(item.main.temp),
      condition: item.weather[0].id
    };
  });
  return {
    hourly: hourly,
    daily: makeDailyForecast(weather)
  };
};

var makeWeatherObj = function makeWeatherObj(options, weatherResponse) {
  if (options.type === 'forecast') {
    return makeForecast(weatherResponse, options.forecastType);
  }

  return makeWeather(weatherResponse);
};

exports.makeWeatherObj = makeWeatherObj;