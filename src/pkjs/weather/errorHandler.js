"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.resetErrors = void 0;

var _objectSpread3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectSpread"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _dateFns = _interopRequireDefault(require("date-fns"));

var _weatherAttributeTables = require("./weatherAttributeTables");

var _maxAttempts, _zeroErrors;

var storageKey = 'errors';
var millisecondsInSecond = 1000;

var loadErrors = function loadErrors() {
  return JSON.parse(localStorage.getItem(storageKey) || '{}');
};

var saveErrors = function saveErrors(errors) {
  return localStorage.setItem(storageKey, (0, _stringify.default)(errors));
};

var maxAttempts = (_maxAttempts = {}, (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.weather_ok, 1), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.weather_disabled, 1), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.location_error, 8), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.invalid_location_id, 1), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.unknown_error, 5), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.api_key_invalid, 1), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.api_key_not_set, 1), (0, _defineProperty2.default)(_maxAttempts, _weatherAttributeTables.messages.banned, 1), _maxAttempts);
var zeroErrors = (_zeroErrors = {}, (0, _defineProperty2.default)(_zeroErrors, _weatherAttributeTables.messages.location_error, {
  attempts: 0
}), (0, _defineProperty2.default)(_zeroErrors, _weatherAttributeTables.messages.unknown_error, {
  attempts: 0
}), _zeroErrors);

var resetErrors = function resetErrors() {
  // console.log('reset all errors');
  saveErrors(zeroErrors);
};

exports.resetErrors = resetErrors;
var typeTable = {
  weather: {
    marker: 'WeatherMarker',
    stamp: 'WeatherTimeStamp',
    offsetInMinutes: 15
  },
  forecast: {
    marker: 'WeatherMarkerForecast',
    stamp: 'ForecastTime',
    offsetInMinutes: 15
  }
};

var _default = function _default(pebbleObject, type) {
  var _ref2;

  var WeatherError = pebbleObject.WeatherError; // console.log(`error: ${WeatherError}`);

  if (maxAttempts[WeatherError] === 1) {
    resetErrors();

    if (!type) {
      return (0, _objectSpread3.default)({}, pebbleObject, {
        WeatherMarker: true
      });
    }

    return pebbleObject;
  }

  var allErrors = loadErrors();
  var error = allErrors[WeatherError]; // console.log(`curr error: ${JSON.stringify(error)}`);

  var currentAttempt = error.attempts ? error.attempts + 1 : 1; // console.log(`error ${JSON.stringify(error)},
  // attempt ${currentAttempt}, old: ${error.attempts}, ${maxAttempts[WeatherError]}`);

  var currentType = typeTable[type];

  if (currentAttempt >= maxAttempts[WeatherError]) {
    var _ref;

    var _newTime = _dateFns.default.addMinutes(new Date(), currentType.offsetInMinutes);

    var _nextTime = Date.parse(_newTime) / millisecondsInSecond;

    return _ref = {}, (0, _defineProperty2.default)(_ref, currentType.marker, true), (0, _defineProperty2.default)(_ref, currentType.stamp, _nextTime), (0, _defineProperty2.default)(_ref, "WeatherError", WeatherError), _ref;
  }

  var newErrors = (0, _objectSpread3.default)({}, zeroErrors, (0, _defineProperty2.default)({}, WeatherError, {
    attempts: currentAttempt
  }));
  saveErrors(newErrors);

  var newTime = _dateFns.default.addMinutes(new Date(), currentType.offsetInMinutes / 2);

  var nextTime = Date.parse(newTime) / millisecondsInSecond;
  return _ref2 = {}, (0, _defineProperty2.default)(_ref2, currentType.marker, true), (0, _defineProperty2.default)(_ref2, currentType.stamp, nextTime), (0, _defineProperty2.default)(_ref2, "WeatherError", _weatherAttributeTables.messages.weather_ok), _ref2;
};

exports.default = _default;