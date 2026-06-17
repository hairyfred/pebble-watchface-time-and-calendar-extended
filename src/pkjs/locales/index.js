"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ru = _interopRequireDefault(require("./ru"));

var countryCodes = {
  'ru-RU': 'ru',
  'en-US': 'en'
};
var locales = {
  en: {},
  ru: _ru.default
};

var _default = function _default() {
  var lang = countryCodes[navigator.language] || 'en';
  return locales[lang];
};

exports.default = _default;