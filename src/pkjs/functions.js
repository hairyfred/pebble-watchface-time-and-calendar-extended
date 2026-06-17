"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(minified) {
  var clayConfig = this;

  var registerToggle = function registerToggle(items) {
    return items.forEach(function (item) {
      // const master = item[0];
      // const slave = item[1];
      // const [master, slave] = item;
      // Disabled due to babel polyfill error
      var masterItem = clayConfig.getItemByMessageKey(item[0]);

      if (!masterItem) {
        return;
      }

      var slaveItem = clayConfig.getItemByMessageKey(item[1]);
      masterItem.on('change', function () {
        if (masterItem.get()) {
          slaveItem.enable();
        } else {
          slaveItem.disable();
        }
      });
      masterItem.trigger('change');
    });
  };

  var showGroups = function showGroups(groups) {
    return groups.forEach(function (group) {
      clayConfig.getItemsByGroup(group).forEach(function (item) {
        item.show();
      });
    });
  };

  var hideGroups = function hideGroups(groups) {
    return groups.forEach(function (group) {
      clayConfig.getItemsByGroup(group).forEach(function (item) {
        item.hide();
      });
    });
  };

  var toggleSelectTable = [{
    selectId: 'WeatherProvider',
    values: {
      OWM: {
        hideGroups: [],
        showGroups: ['OWM', 'weather'],
        hook: function hook() {
          clayConfig.getItemById('WeatherLocationType').trigger('change');
        }
      },
      disable: {
        hideGroups: ['OWM', 'weather', 'weather_id'],
        showGroups: []
      }
    }
  }, {
    selectId: 'WeatherLocationType',
    values: {
      gps: {
        hideGroups: ['weather_id'],
        showGroups: []
      },
      cid: {
        hideGroups: [],
        showGroups: ['weather_id']
      }
    }
  }];

  var registerSelectToggles = function registerSelectToggles() {
    return toggleSelectTable.forEach(function (select) {
      var item = clayConfig.getItemById(select.selectId);

      if (!item) {
        return;
      }

      item.on('change', function () {
        var groups = select.values[item.get()];
        showGroups(groups.showGroups);
        hideGroups(groups.hideGroups);

        if (groups.hook) {
          groups.hook();
        }
      });
      item.trigger('change');
    });
  };

  var compareVersions = function compareVersions(ver1, ver2) {
    if (ver1 === ver2) {
      return 0;
    }

    var va1 = ver1.split('.');
    var va2 = ver2.split('.');

    var iter = function iter(index) {
      if (index > 2) {
        return 0;
      }

      var v1 = Number(va1[index]);
      var v2 = Number(va2[index]);

      if (v1 > v2) {
        return -1;
      }

      if (v1 < v2) {
        return 1;
      }

      return iter(index + 1);
    };

    return iter(0);
  };

  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function () {
    var currentVersion = "v. ".concat(clayConfig.meta.userData.version);
    clayConfig.getItemById('versionId').set(currentVersion);
    var updateElem = clayConfig.getItemById('updateId');
    clayConfig.getItemById('updateCheckBtn').on('click', function () {
      updateElem.set('Checking...');
      minified.$.request('get', 'https://raw.githubusercontent.com/UnnamedHero/pebble-watchface-time-and-calendar/master/package.json').then(function (resp) {
        var _JSON$parse = JSON.parse(resp),
            version = _JSON$parse.version;

        var versionCompareRes = compareVersions(clayConfig.meta.userData.version, version);

        if (versionCompareRes > 0) {
          updateElem.set("New version ".concat(version, " is available. Get it here at <a href='https://github.com/UnnamedHero/pebble-watchface-time-and-calendar/blob/master/README.md'>project homepage</a> "));
          return;
        }

        updateElem.set('You have actual version');
      }).error(function () {
        updateElem.set('Sorry, can\'t tell anything about new version availability');
      });
    });
    registerToggle([['VibrateConnected', 'VibrateConnectedType'], ['VibrateDisconnected', 'VibrateDisconnectedType'], ['VibratePeriodic', 'VibratePeriodicType'], ['VibratePeriodic', 'VibratePeriodicPeroid'], ['QuietTime', 'QuietTimeBegin'], ['QuietTime', 'QuietTimeEnd'], ['ForecastType', 'SwitchBackTimeout'], ['PebbleShakeAction', 'SwitchBackTimeoutSeconds'], ['ColorTimeShift', 'ColorShiftTimeBegin'], ['ColorTimeShift', 'ColorShiftTimeEnd'], ['ColorTimeShift', 'ShiftFontColor'], ['ColorTimeShift', 'ShiftBackgroundColor'], ['HealthSteps', 'HealthLeftBarType'], ['HealthSteps', 'HealthRightBarType']]);
    registerSelectToggles();
  });
}