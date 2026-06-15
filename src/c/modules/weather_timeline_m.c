#include <pebble.h>
#include "include/weather_timeline_m.h"
#include "include/forecast_m.h"
#include "../settings.h"

// A compact forecast "timeline" along the bottom: one column per forecast point
// (time on top, weather icon in the middle, temperature at the bottom). Reuses
// the forecast data already fetched by forecast_m (the separate forecast window
// shows the same data in a larger layout). Requires the forecast to be enabled
// in settings (Forecast type: 3h / 6h).
static Layer *s_this_layer = NULL;
static GFont s_icon_font;
static void prv_populate_weather_timeline_layer(Layer *, GContext *);

void init_weather_timeline_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  s_icon_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_CLIMACONS_20));
  layer_set_update_proc(s_this_layer, prv_populate_weather_timeline_layer);
  // The forecast struct is otherwise only loaded when the forecast window opens;
  // load the persisted forecast now so the timeline can render at startup.
  forecast_load();
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

static void prv_populate_weather_timeline_layer(Layer *me, GContext *ctx) {
  if (get_forecast_ready() != 1) {
    return;
  }
  int qty = get_forecast_qty();
  if (qty == 0) {
    return;
  }
  settings_get_theme(ctx);
  GRect b = layer_get_bounds(me);
  GFont text_font = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  const int col_w = b.size.w / qty;
  const int time_h = 14;
  const int icon_h = 20;

  for (int i = 0; i < qty; i++) {
    const int x = i * col_w;
    GRect time_rect = GRect(x, 0, col_w, time_h);
    GRect icon_rect = GRect(x, time_h, col_w, icon_h);
    GRect temp_rect = GRect(x, time_h + icon_h - 2, col_w, b.size.h - time_h - icon_h + 2);

    char temp_txt[8];
    snprintf(temp_txt, sizeof(temp_txt), "%d°", get_forecast_temperature(i));

    graphics_draw_text(ctx, get_forecast_timestamp(i), text_font, \
        time_rect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
    graphics_draw_text(ctx, get_forecast_condition(i), s_icon_font, \
        icon_rect, GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
    graphics_draw_text(ctx, temp_txt, text_font, \
        temp_rect, GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  }
}
