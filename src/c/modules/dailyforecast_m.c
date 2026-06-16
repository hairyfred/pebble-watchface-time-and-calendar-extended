#include <pebble.h>
#include "include/dailyforecast_m.h"

// Stores the aggregated ~5-day daily forecast (day label + condition glyph +
// high temp), delivered in the same AppMessage as the hourly forecast. The
// inline bottom timeline reads this when the user flicks to "daily" mode.
typedef struct DailyForecastData {
  uint8_t Ready;
  uint8_t Qty;
  int Temperature[6];
  char DayLabel[6][4];
  char Condition[6][4];
} __attribute__((__packed__)) DailyForecastData;

static DailyForecastData daily;

static void prv_default() {
  daily.Ready = 0;
  daily.Qty = 0;
}

void dailyforecast_load() {
  prv_default();
  persist_read_data(DAILY_FORECAST_KEY, &daily, sizeof(daily));
}

static void prv_save() {
  persist_write_data(DAILY_FORECAST_KEY, &daily, sizeof(daily));
}

void dailyforecast_update(DictionaryIterator *iter, void *context) {
  Tuple *f_mark = dict_find(iter, MESSAGE_KEY_WeatherMarkerForecast);
  if (f_mark) {
    daily.Ready = f_mark->value->uint8;
  }
  Tuple *qty = dict_find(iter, MESSAGE_KEY_DailyForecastQty);
  if (qty) {
    daily.Qty = qty->value->uint8 > 6 ? 6 : qty->value->uint8;
  }
  if (daily.Ready != 1 || daily.Qty == 0) {
    return;
  }
  for (int i = 0; i < daily.Qty; i++) {
    Tuple *t = dict_find(iter, MESSAGE_KEY_DailyForecastTemperature + i);
    if (t) {
      daily.Temperature[i] = t->value->int32;
    }
    Tuple *d = dict_find(iter, MESSAGE_KEY_DailyForecastDayLabel + i);
    if (d) {
      snprintf(daily.DayLabel[i], sizeof(daily.DayLabel[i]), "%s", d->value->cstring);
    }
    Tuple *c = dict_find(iter, MESSAGE_KEY_DailyForecastCondition + i);
    if (c) {
      snprintf(daily.Condition[i], sizeof(daily.Condition[i]), "%s", c->value->cstring);
    }
  }
  prv_save();
}

uint8_t get_daily_forecast_ready() {
  return daily.Ready;
}

uint8_t get_daily_forecast_qty() {
  return daily.Qty > 6 ? 6 : daily.Qty;
}

char* get_daily_forecast_daylabel(int i) {
  return daily.DayLabel[i];
}

char* get_daily_forecast_condition(int i) {
  return daily.Condition[i];
}

int get_daily_forecast_temperature(int i) {
  return daily.Temperature[i];
}
