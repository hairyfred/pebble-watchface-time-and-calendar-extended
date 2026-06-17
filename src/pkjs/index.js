"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectSpread"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _pebbleClay = _interopRequireDefault(require("pebble-clay"));

var _message_keys = _interopRequireDefault(require("message_keys"));

var _config = _interopRequireDefault(require("./config"));

var _functions = _interopRequireDefault(require("./functions"));

var _localizator = _interopRequireDefault(require("./localizator"));

var _sender = _interopRequireDefault(require("./sender"));

var _weather = _interopRequireDefault(require("./weather"));

var _ip = _interopRequireDefault(require("./lib/ip"));

var _package = require("../../package.json");

//eslint-disable-line
var clayOpts = {
  autoHandleEvents: false,
  userData: {
    version: _package.version
  }
};
var clay = new _pebbleClay.default((0, _localizator.default)(_config.default), _functions.default, clayOpts);

var sendPhoneIP =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var info, msg;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _ip.default)();

          case 2:
            info = _context.sent;
            console.log("sendPhoneIP result: ".concat((0, _stringify.default)(info)));

            if (info && info.ip) {
              msg = {
                PhoneIP: info.ip
              };

              if (info.isp) {
                msg.PhoneISP = info.isp;
              }

              (0, _sender.default)(msg);
            }

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function sendPhoneIP() {
    return _ref.apply(this, arguments);
  };
}(); // Phone battery via the Web Battery API. Present on Android; undefined on iOS,
// where initPhoneBattery() simply returns and nothing is ever sent.


var batteryManager = null;

var sendPhoneBattery = function sendPhoneBattery() {
  if (batteryManager) {
    (0, _sender.default)({
      PhoneBattery: Math.round(batteryManager.level * 100)
    });
  }
};

var initPhoneBattery = function initPhoneBattery() {
  if (!navigator.getBattery) {
    //eslint-disable-line
    return;
  }

  navigator.getBattery().then(function (b) {
    //eslint-disable-line
    batteryManager = b;
    b.addEventListener('levelchange', sendPhoneBattery);
    b.addEventListener('chargingchange', sendPhoneBattery);
    sendPhoneBattery();
  }).catch(function () {});
};

Pebble.addEventListener('showConfiguration', function () {
  //eslint-disable-line
  Pebble.openURL(clay.generateUrl()); //eslint-disable-line
});
Pebble.addEventListener('webviewclosed', function (e) {
  //eslint-disable-line
  if (e && !e.response) {
    return;
  }

  var dict = clay.getSettings(e.response);

  var fixTimeField = function fixTimeField(fields) {
    return fields.forEach(function (field) {
      if (dict[field]) {
        var timeValue = dict[field].split(':', 2);
        dict[field] = (0, _parseInt2.default)(timeValue[0], 10);
        dict[field + 1] = (0, _parseInt2.default)(timeValue[1], 10);
      }
    });
  };

  fixTimeField([_message_keys.default.QuietTimeBegin, _message_keys.default.QuietTimeEnd, _message_keys.default.ColorShiftTimeBegin, _message_keys.default.ColorShiftTimeEnd]);
  var dateFormat = dict[_message_keys.default.DateFormat];
  var dateSeparator = dict[_message_keys.default.DateFormatSeparator];
  var newDateFormat = dateFormat.replace(new RegExp('\\.', 'g'), dateSeparator);
  dict[_message_keys.default.DateFormat] = newDateFormat;
  dict[_message_keys.default.ConfigMarker] = true;
  var switchBackTimeout = dict[_message_keys.default.SwitchBackTimeout];
  dict[_message_keys.default.SwitchBackTimeout] = (0, _parseInt2.default)(switchBackTimeout, 10);
  var switchBackTimeoutSeconds = dict[_message_keys.default.SwitchBackTimeoutSeconds];
  dict[_message_keys.default.SwitchBackTimeoutSeconds] = (0, _parseInt2.default)(switchBackTimeoutSeconds, 10);
  var pebbleShakeAction = dict[_message_keys.default.PebbleShakeAction];
  dict[_message_keys.default.PebbleShakeAction] = (0, _parseInt2.default)(pebbleShakeAction, 10);
  var helperSettings = {
    provider: dict[_message_keys.default.WeatherProvider],
    apiKey: dict[_message_keys.default.WeatherAPIKey],
    cityId: dict[_message_keys.default.NP_CityID],
    locationType: dict[_message_keys.default.NP_WeatherLocationType],
    units: dict[_message_keys.default.WeatherUnits],
    forecastType: dict[_message_keys.default.ForecastType]
  };
  localStorage.setItem('clay-helper', (0, _stringify.default)(helperSettings));
  (0, _sender.default)(dict);
  sendPhoneIP();
  sendPhoneBattery();
});
Pebble.addEventListener('ready', function () {
  //eslint-disable-line
  console.log('PebbleKit JS ready!');
  (0, _sender.default)({
    JSReady: 1
  });
  sendPhoneIP();
  initPhoneBattery();
  setInterval(sendPhoneBattery, 30 * 60 * 1000);
});

var getRequestType = function getRequestType(message) {
  if (message.WeatherMarkerForecast === 1) {
    return 'forecast';
  }

  if (message.WeatherMarker === 1) {
    return 'weather';
  }

  return 'unknown';
};

Pebble.addEventListener('appmessage',
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(e) {
    var message, requestType, data, options, pebbleWeather;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //eslint-disable-line
            message = e.payload;
            requestType = getRequestType(message); // console.log(`request: ${requestType}, ${JSON.stringify(message)}`);

            if (!(requestType === 'unknown')) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return");

          case 4:
            data = JSON.parse(localStorage.getItem('clay-helper') || '{}');
            options = (0, _objectSpread2.default)({}, data, {
              type: requestType
            });
            _context2.next = 8;
            return (0, _weather.default)(options);

          case 8:
            pebbleWeather = _context2.sent;
            (0, _sender.default)(pebbleWeather);

          case 10:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}());