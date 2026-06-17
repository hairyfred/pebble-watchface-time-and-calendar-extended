"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _default = function _default(url) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
  return new _promise.default(function (resolve) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
      return resolve(xhr.responseText);
    };

    xhr.onerror = function () {
      console.log("error: ".concat((0, _stringify.default)(xhr)));
      resolve((0, _stringify.default)({
        cod: '520'
      }));
    };

    xhr.ontimeout = function () {
      console.log('request timeout');
      resolve((0, _stringify.default)({
        cod: '408'
      }));
    };

    xhr.open(type, url, true); // 2s was too aggressive on a cold mobile radio and caused weather fetches to
    // fail intermittently (which blanked the weather). 8s is far more forgiving.

    xhr.timeout = 8000;
    xhr.send();
    setTimeout(function () {
      if (xhr.readyState < 4) {
        console.log('abort request');
        xhr.abort();
        resolve((0, _stringify.default)({
          cod: '520'
        }));
      }
    }, 10000);
  });
};

exports.default = _default;