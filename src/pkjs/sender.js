"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var timeout = 5000;
var maxAttempts = 5;

var sender = function sender(data, attempt) {
  if (attempt > maxAttempts) {
    console.log('Message send FAILED');
    return;
  }

  var onSuccess = function onSuccess() {
    console.log('Data sent to Pebble successfully!');
  };

  var onError = function onError(nextAttempt, id, error) {
    console.log("Error sending data to Pebble! ".concat((0, _stringify.default)(id), ": ").concat(error, ". Next Attempt: ").concat(nextAttempt, " in ").concat(timeout, " ms"));
    setTimeout(function () {
      sender(data, nextAttempt);
    }, timeout);
  }; // console.log(`data to send: ${JSON.stringify(data)}`);


  Pebble.sendAppMessage(data, onSuccess, onError.bind(undefined, attempt + 1)); //eslint-disable-line
};

var _default = function _default(data) {
  return sender(data, 1);
};

exports.default = _default;