"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _locales = _interopRequireDefault(require("./locales"));

var localizator = function localizator(config) {
  var locale = (0, _locales.default)();

  var getTranslatedValue = function getTranslatedValue(val) {
    var localizedstring = locale[val];
    return localizedstring || val;
  };

  return config.map(function (item) {
    if (typeof item === 'string') {
      return getTranslatedValue(item);
    }

    var newItem = item;

    if (item.value) {
      newItem.value = getTranslatedValue(item.value);
    }

    if (item.label) {
      newItem.label = getTranslatedValue(item.label);
    }

    if (item.defaultValue) {
      newItem.defaultValue = getTranslatedValue(item.defaultValue);
    }

    if (item.items) {
      newItem.items = localizator(item.items);
    }

    if (item.options) {
      newItem.options = localizator(item.options);
    }

    return newItem;
  });
};

var _default = localizator;
exports.default = _default;