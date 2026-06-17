"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs2/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.makeError = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _objectSpread4 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectSpread"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _dateFns = _interopRequireDefault(require("date-fns"));

var _message_keys = _interopRequireDefault(require("message_keys"));

var _weatherAttributeTables = require("./weatherAttributeTables");

var _errorHandler = _interopRequireWildcard(require("./errorHandler"));

//eslint-disable-line
// import { getTZOffestInSeconds } from '../lib/time';
var sunStorageKey = 'SunTimes';

var isDayAt = function isDayAt(sunrise, sunset, time) {
  return _dateFns.default.isWithinRange(time, sunrise, sunset);
};

var getConditionSymbol = function getConditionSymbol(conditionCode, sunrise, sunset) {
  var time = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Date();
  var symbol = _weatherAttributeTables.conditions[conditionCode].symbol || 'h';

  if (conditionCode >= 800 && conditionCode <= 803) {
    var _symbol = (0, _slicedToArray2.default)(symbol, 2),
        day = _symbol[0],
        night = _symbol[1];

    return isDayAt(sunrise, sunset, time) ? day : night;
  }

  return symbol;
};

var formatTime = function formatTime(time, formatString) {
  return _dateFns.default.format(time, formatString);
};

var saveSunTimes = function saveSunTimes(sunrise, sunset) {
  var item = {
    sunrise: sunrise,
    sunset: sunset
  };
  localStorage.setItem(sunStorageKey, (0, _stringify.default)(item));
};

var getSunTimes = function getSunTimes() {
  return JSON.parse(localStorage.getItem(sunStorageKey));
};

var makeWeather = function makeWeather(weather) {
  var sunrise = weather.sunrise,
      sunset = weather.sunset;
  saveSunTimes(sunrise, sunset);
  return {
    WeatherMarker: true,
    WeatherTemperature: weather.temperature,
    WeatherCondition: getConditionSymbol(weather.condition, sunrise, sunset),
    // timestamp from OWM is toooooo old
    WeatherTimeStamp: weather.timeStamp,
    WeatherPressure: weather.pressure,
    WeatherWindSpeed: weather.windSpeed,
    WeatherWindDirection: (0, _weatherAttributeTables.getWindDirectionSymbol)(weather.windDirection),
    WeatherHumidity: weather.humidity,
    WeatherSunrise: formatTime(sunrise, 'HH:mm'),
    WeatherSunset: formatTime(sunset, 'HH:mm'),
    WeatherError: _weatherAttributeTables.messages.weather_ok
  };
};

var makeForecast = function makeForecast(data) {
  var _ref = getSunTimes() || {},
      _ref$sunrise = _ref.sunrise,
      sunrise = _ref$sunrise === void 0 ? new Date() : _ref$sunrise,
      _ref$sunset = _ref.sunset,
      sunset = _ref$sunset === void 0 ? new Date() : _ref$sunset;

  var hourly = data.hourly || [];
  var daily = data.daily || []; // Hourly: show just the time (HH:mm) above each icon, not the date.

  var hourlyData = hourly.reduce(function (acc, item, index) {
    var _objectSpread2;

    var timeStamp = item.timeStamp * 1000;
    var conditionSymbol = getConditionSymbol(item.condition, sunrise, sunset, timeStamp);
    return (0, _objectSpread4.default)({}, acc, (_objectSpread2 = {}, (0, _defineProperty2.default)(_objectSpread2, _message_keys.default.ForecastTemperature + index, item.temperature), (0, _defineProperty2.default)(_objectSpread2, _message_keys.default.ForecastTimeStamp + index, formatTime(timeStamp, 'HH:mm')), (0, _defineProperty2.default)(_objectSpread2, _message_keys.default.ForecastCondition + index, conditionSymbol), _objectSpread2));
  }, {}); // Daily: a short day label (Mon, Tue...) above each icon.

  var dailyData = daily.reduce(function (acc, day, index) {
    var _objectSpread3;

    var conditionSymbol = getConditionSymbol(day.condition, sunrise, sunset, day.midTimeStamp);
    return (0, _objectSpread4.default)({}, acc, (_objectSpread3 = {}, (0, _defineProperty2.default)(_objectSpread3, _message_keys.default.DailyForecastTemperature + index, day.temperature), (0, _defineProperty2.default)(_objectSpread3, _message_keys.default.DailyForecastDayLabel + index, day.dayLabel), (0, _defineProperty2.default)(_objectSpread3, _message_keys.default.DailyForecastCondition + index, conditionSymbol), _objectSpread3));
  }, {});
  return (0, _objectSpread4.default)({
    WeatherMarkerForecast: true,
    ForecastQty: hourly.length,
    ForecastTime: hourly.length ? hourly[0].timeStamp : 0,
    DailyForecastQty: daily.length
  }, hourlyData, dailyData, {
    WeatherError: _weatherAttributeTables.messages.weather_ok
  });
};

var makeError = function makeError(code, type) {
  return (0, _errorHandler.default)(code, type);
};

exports.makeError = makeError;

var _default = function _default(data, type) {
  var WeatherError = data.WeatherError;

  if (WeatherError) {
    return makeError(data, type);
  }

  switch (type) {
    case 'weather':
      (0, _errorHandler.resetErrors)();
      return makeWeather(data);

    case 'forecast':
      (0, _errorHandler.resetErrors)();
      return makeForecast(data);

    default:
      return makeError(data, type);
  }
};

exports.default = _default;