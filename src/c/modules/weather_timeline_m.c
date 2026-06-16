#include <pebble.h>
#include "include/weather_timeline_m.h"
#include "include/forecast_m.h"
#include "include/dailyforecast_m.h"
#include "../settings.h"

// A compact forecast "timeline" along the bottom: one column per point
// (label on top, weather icon in the middle, temperature at the bottom).
// Two modes, toggled by a wrist flick: hourly (time labels, from forecast_m)
// and daily (day labels Mon/Tue..., from dailyforecast_m). Both reuse the data
// already fetched in one OWM call. Requires forecast enabled (3h / 6h).
static Layer *s_this_layer = NULL;
static GFont s_icon_font;
static int s_mode = 0; // 0 = hourly, 1 = daily
static void prv_populate_weather_timeline_layer(Layer *, GContext *);

void init_weather_timeline_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  s_icon_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_CLIMACONS_20));
  layer_set_update_proc(s_this_layer, prv_populate_weather_timeline_layer);
  // The forecast structs are otherwise only loaded when the forecast window
  // opens; load the persisted data now so the timeline renders at startup.
  forecast_load();
  dailyforecast_load();
}

void deinit_weather_timeline_layer() {
  if (s_this_layer) {
    layer_destroy(s_this_layer);
    s_this_layer = NULL;
    fonts_unload_custom_font(s_icon_font);
  }
}

Layer* get_layer_weather_timeline() {
  return s_this_layer;
}

void weather_timeline_toggle_mode() {
  s_mode = s_mode ? 0 : 1;
  if (s_this_layer) {
    layer_mark_dirty(s_this_layer);
  }
}

static void prv_populate_weather_timeline_layer(Layer *me, GContext *ctx) {
  const bool daily = s_mode == 1;
  const int ready = daily ? get_daily_forecast_ready() : get_forecast_ready();
  const int qty = daily ? get_daily_forecast_qty() : get_forecast_qty();
  if (ready != 1 || qty == 0) {
    return;
  }
  settings_get_theme(ctx);
  GRect b = layer_get_bounds(me);
  GFont text_font = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  const int col_w = b.size.w / qty;
  const int label_h = 14;
  const int icon_h = 20;

  for (int i = 0; i < qty; i++) {
    const int x = i * col_w;
    GRect label_rect = GRect(x, 0, col_w, label_h);
    GRect icon_rect = GRect(x, label_h, col_w, icon_h);
    GRect temp_rect = GRect(x, label_h + icon_h - 2, col_w, b.size.h - label_h - icon_h + 2);

    char *label = daily ? get_daily_forecast_daylabel(i) : get_forecast_timestamp(i);
    char *condition = daily ? get_daily_forecast_condition(i) : get_forecast_condition(i);
    int temp = daily ? get_daily_forecast_temperature(i) : get_forecast_temperature(i);

    char temp_txt[8];
    snprintf(temp_txt, sizeof(temp_txt), "%d°", temp);

    graphics_draw_text(ctx, label, text_font, \
        label_rect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
    graphics_draw_text(ctx, condition, s_icon_font, \
        icon_rect, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
    graphics_draw_text(ctx, temp_txt, text_font, \
        temp_rect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  }
}
