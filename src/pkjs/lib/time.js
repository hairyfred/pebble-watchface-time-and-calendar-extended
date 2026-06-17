"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocalTimeStampFromUtc = exports.getLocalTimeFromUtc = exports.getTZOffestInSeconds = void 0;
var secondsPerMinute = 60;

var getTZOffestInSeconds = function getTZOffestInSeconds() {
  return new Date().getTimezoneOffset() * secondsPerMinute;
};

exports.getTZOffestInSeconds = getTZOffestInSeconds;

var getLocalTimeFromUtc = function getLocalTimeFromUtc(utc) {
  return new Date(utc - getTZOffestInSeconds());
};

exports.getLocalTimeFromUtc = getLocalTimeFromUtc;

var getLocalTimeStampFromUtc = function getLocalTimeStampFromUtc(utc) {
  return utc - getTZOffestInSeconds();
};

exports.getLocalTimeStampFromUtc = getLocalTimeStampFromUtc;