#include <pebble.h>
#include "include/time-window.h"
#include "../modules/include/calendar_m.h"
#include "../modules/include/bluetooth_m.h"
#include "../modules/include/battery_m.h"
#include "../modules/include/date_m.h"
//#include "../modules/include/time_m.h"
#include "../modules/include/weather_m.h"
#include "../modules/include/health.h"
#include "../modules/include/weather_timeline_m.h"
#include "../modules/include/phone_battery_m.h"
#include "../modules/include/weather_extras_m.h"
#include "../modules/include/health_strip_m.h"
#include "../modules/include/ip_m.h"
#include "../settings.h"

static Window *s_time_window;

static void prv_populate_tw_layer(Layer *, GContext *);

Window* get_time_window() {
  #if defined (DEBUG) 
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Request time window");
  #endif  
  if (!s_time_window) {
    init_time_window();
  }
  return s_time_window;
}

void deinit_time_window() {
  window_destroy(s_time_window);
}

static void prv_window_load(Window *window) {
  #if defined (DEBUG) 
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Time Window loading");
  #endif  
  Layer *window_layer = window_get_root_layer(window);
  const GRect bounds = layer_get_bounds(window_layer);
  // Top row, left to right: phone battery % flush to the left edge, the
  // bluetooth glyph placed snug right after it (positioned dynamically from the
  // measured % width in bluetooth_m.c), the bluetooth sub-indicators (weather
  // error / quiet time / AM-PM), the public IP centered dead-centre, then the
  // watch battery % + icon flush right.
  const GRect bluetooth_bounds = GRect (0, 0, 130, 20);
  const GRect battery_bounds = GRect (bounds.size.w - 47, 0, 52, 20);
  const GRect date_bounds = GRect(0, 22, bounds.size.w, 14);
  //GRect time_bounds = GRect (35, 32, bounds.size.w - 35, 54);
  const GRect calendar_bounds = GRect (2, 92, bounds.size.w, 73);
  GRect weather_bounds = GRect (2, 34, bounds.size.w, 58);

  const int pb_x = 0;
  const int pb_w = 40;
  const int watch_battery_x = bounds.size.w - 47;
  const bool top_has_room = (watch_battery_x - pb_x) >= 40;
  const GRect phone_battery_bounds = GRect(pb_x, 0, pb_w, 20);

  // Public IP centered dead-centre on the screen: a full-width layer with the
  // text centered, so its midpoint is the screen midpoint (x = w/2). Its
  // ~70px-wide text sits clear of the BT cluster on the left and the watch
  // battery on the right in the common case. The bluetooth sub-indicators
  // (weather error / quiet time / AM-PM) draw ON TOP when active, since IP is
  // added as a child before the bluetooth layer.
  const GRect ip_top_bounds = GRect(0, 0, bounds.size.w, 20);

  // Bottom band (tall screens only): a compact weather-extras line above a
  // forecast timeline. Derived from the window height, so it appears on emery /
  // Pebble Time 2 and is absent on the 144x168 platforms with no room below the
  // calendar. Existing top layout is unchanged.
  const int calendar_bottom = calendar_bounds.origin.y + calendar_bounds.size.h;
  const int we_height = 14;   // weather extras: one compact line
  const int tl_height = 46;   // forecast timeline: time + icon + temp
  const int bottom_margin = 1;
  const int tl_y = bounds.size.h - tl_height - bottom_margin;
  const int we_y = calendar_bottom + 1;
  const bool bottom_has_room = tl_y >= (we_y + we_height);
  const GRect weather_extras_bounds = GRect(2, we_y, bounds.size.w - 4, we_height);
  const GRect timeline_bounds = GRect(2, tl_y, bounds.size.w - 4, tl_height);

  init_bluetooh_layer(bluetooth_bounds);
  init_battery_layer(battery_bounds);

 // init_time_layer(time_bounds);

  init_calendar_layer(calendar_bounds);
  init_weather_layer(weather_bounds);
  if (top_has_room) {
    init_phone_battery_layer(phone_battery_bounds);
    init_ip_layer(ip_top_bounds);
  }
  if (bottom_has_room) {
    init_weather_extras_layer(weather_extras_bounds);
    init_weather_timeline_layer(timeline_bounds);
  }
  if (settings_get_HealthSteps()) {
    init_health_layer(date_bounds);
    layer_add_child(window_layer, get_layer_health());
  } else {
    init_date_layer(date_bounds);
    layer_add_child(window_layer, get_layer_date());
    // On wide screens, flank the centered date with heart rate (left) + steps
    // (right) using the otherwise-empty horizontal margins.
    if (top_has_room) {
      init_health_strip_layer(date_bounds);
      layer_add_child(window_layer, get_layer_health_strip());
    }
  }
  // IP first so the bluetooth layer's sub-indicators (weather error / quiet
  // time / AM-PM) draw over it when active rather than being hidden behind it.
  if (get_layer_ip()) {
    layer_add_child(window_layer, get_layer_ip());
  }
  layer_add_child(window_layer, get_layer_bluetooth());
  layer_add_child(window_layer, get_layer_battery());
  
 // layer_add_child(window_layer, get_layer_time());
  layer_add_child(window_layer, get_layer_calendar());
  layer_add_child(window_layer, get_layer_weather());
  if (get_layer_phone_battery()) {
    layer_add_child(window_layer, get_layer_phone_battery());
  }
  if (get_layer_weather_extras()) {
    layer_add_child(window_layer, get_layer_weather_extras());
  }
  if (get_layer_weather_timeline()) {
    layer_add_child(window_layer, get_layer_weather_timeline());
  }
}

static void prv_window_unload(Window *window) {
  deinit_bluetooth_layer();
  deinit_battery_layer();
  if (settings_get_HealthSteps()) {
    deinit_health_layer();
  } else {
    deinit_date_layer();
  }  
  deinit_calendar_layer();
  deinit_weather_layer();
  deinit_weather_timeline_layer();
  deinit_phone_battery_layer();
  deinit_weather_extras_layer();
  deinit_health_strip_layer();
  deinit_ip_layer();
}

void init_time_window() {
  #if defined (DEBUG) 
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Time Window init"); 
  #endif
  
  s_time_window = window_create();
  window_set_window_handlers(s_time_window, (WindowHandlers) {
    .load = prv_window_load,
    .unload = prv_window_unload,
  });
  layer_set_update_proc(window_get_root_layer(s_time_window), prv_populate_tw_layer);
}

static void prv_populate_tw_layer(Layer *me, GContext *ctx) {
  GRect this_rect = layer_get_bounds(me);
  settings_get_theme(ctx);
  graphics_fill_rect(ctx, this_rect, 0, GCornerNone);  
};

void window_update_time(struct tm *tick_time) {
  #if defined (DEBUG) 
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Time Window update time handler");
  #endif
  

  layer_mark_dirty(get_layer_weather());
}


void ready_for_weather(bool force) {
  update_weather(force);
}

void time_window_swap_weather() {
  weather_timeline_toggle_mode();
}

void simple_weather_update(DictionaryIterator *iter, void *context) {
  get_weather(iter, context);
}

void time_window_force_redraw() {
  layer_mark_dirty(get_layer_bluetooth());
  layer_mark_dirty(get_layer_battery());
  if (settings_get_HealthSteps()) {
    layer_mark_dirty(get_layer_health());
  } else {
    layer_mark_dirty(get_layer_date());
  }
  layer_mark_dirty(get_layer_calendar());
  layer_mark_dirty(get_layer_weather());
  if (get_layer_weather_timeline()) {
    layer_mark_dirty(get_layer_weather_timeline());
  }
  if (get_layer_phone_battery()) {
    layer_mark_dirty(get_layer_phone_battery());
  }
  if (get_layer_weather_extras()) {
    layer_mark_dirty(get_layer_weather_extras());
  }
  if (get_layer_health_strip()) {
    layer_mark_dirty(get_layer_health_strip());
  }
  if (get_layer_ip()) {
    layer_mark_dirty(get_layer_ip());
  }
}