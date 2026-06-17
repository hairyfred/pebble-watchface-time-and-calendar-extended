"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs2/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var openWeatherMap = _interopRequireWildcard(require("./openweathermap"));

var providers = {
  disabled: null,
  OWM: openWeatherMap
};

var _default = function _default(providerKey) {
  return providers[providerKey];
};

exports.default = _default;