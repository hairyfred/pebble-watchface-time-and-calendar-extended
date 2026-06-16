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
  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  // Uppercase the wind direction ("nw" -> "NW") for a tidier look.
  char dir[6];
  const char *src = get_WeatherWindDirection();
  int i = 0;
  for (; src[i] != '\0' && i < (int)sizeof(dir) - 1; i++) {
    dir[i] = (src[i] >= 'a' && src[i] <= 'z') ? src[i] - 32 : src[i];
  }
  dir[i] = '\0';

  // Three segments across the line: humidity (left), wind (centre), sunset
  // (right). "Set HH:MM" is the sunset time from the weather data.
  static char hum_txt[14];
  static char wind_txt[16];
  static char set_txt[16];
  snprintf(hum_txt, sizeof(hum_txt), "Hum %d%%", get_WeatherHumidity());
  snprintf(wind_txt, sizeof(wind_txt), "Wind %d %s", get_WeatherWindSpeed(), dir);
  snprintf(set_txt, sizeof(set_txt), "Set %s", get_WeatherSunset());

  const int third = b.size.w / 3;
  graphics_draw_text(ctx, hum_txt, font, \
      GRect(2, -2, third - 2, b.size.h + 4), \
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);
  graphics_draw_text(ctx, wind_txt, font, \
      GRect(third, -2, third, b.size.h + 4), \
      GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, set_txt, font, \
      GRect(2 * third, -2, b.size.w - 2 * third - 2, b.size.h + 4), \
      GTextOverflowModeTrailingEllipsis, GTextAlignmentRight, NULL);
}
