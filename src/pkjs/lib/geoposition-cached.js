"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _geoposition = _interopRequireDefault(require("./geoposition"));

var locationStorageKey = 'geocache';

var saveLocation = function saveLocation(location) {
  return localStorage.setItem(locationStorageKey, (0, _stringify.default)(location));
};

var loadLocation = function loadLocation() {
  return JSON.parse(localStorage.getItem(locationStorageKey)) || {};
};

var _default =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(options) {
    var location, loc, _loc;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return (0, _geoposition.default)(options);

          case 3:
            location = _context.sent;
            loc = {
              coords: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              }
            }; // console.log(`save location ${JSON.stringify(loc)}`);

            saveLocation(loc);
            return _context.abrupt("return", loc);

          case 9:
            _context.prev = 9;
            _context.t0 = _context["catch"](0);
            _loc = loadLocation(); // console.log(`use cached location ${JSON.stringify(loc)}`);

            if (!((0, _keys.default)(_loc).length === 0)) {
              _context.next = 14;
              break;
            }

            throw new Error();

          case 14:
            return _context.abrupt("return", _loc);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 9]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = _default;