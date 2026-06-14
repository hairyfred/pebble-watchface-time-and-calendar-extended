#include <pebble.h>
#include "include/weather_extras_m.h"
#include "include/weather_m.h"
#include "../settings.h"

// Surfaces weather data already fetched and held by weather_m (humidity, wind),
// which today is only shown in the forecast view. No extra network calls.
static Layer *s_this_layer = NULL;
static void prv_populate_weather_extras_layer(Layer *, GContext *);

void init_weather_extras_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  layer_set_update_proc(s_this_layer, prv_populate_weather_extras_layer);
}

void deinit_weather_extras_layer() {
  if (s_this_layer) {
    layer_destroy(s_this_layer);
    s_this_layer = NULL;
  }
}

Layer* get_layer_weather_extras() {
  return s_this_layer;
}

static void prv_populate_weather_extras_layer(Layer *me, GContext *ctx) {
  settings_get_theme(ctx);
  if (!settings_get_ShowWeatherExtras()) {
    return;
  }
  WEATHER_STATUS status = settings_get_WeatherStatus();
  if (get_weatherIsReady() != 1 || (status != WEATHER_OK && status != WEATHER_LOCATION_ERROR)) {
    return;
  }
  GRect b = layer_get_bounds(me);
  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_18);

  static char humidity_txt[12];
  static char wind_txt[16];
  snprintf(humidity_txt, sizeof(humidity_txt), "H:%d%%", get_WeatherHumidity());
  snprintf(wind_txt, sizeof(wind_txt), "W:%d%s", get_WeatherWindSpeed(), get_WeatherWindDirection());

  graphics_draw_text(ctx, humidity_txt, font, \
      GRect(2, -3, b.size.w / 2 - 2, b.size.h), \
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  graphics_draw_text(ctx, wind_txt, font, \
      GRect(b.size.w / 2, -3, b.size.w / 2 - 4, b.size.h), \
      GTextOverflowModeTrailingEllipsis, GTextAlignmentRight, NULL);
}
