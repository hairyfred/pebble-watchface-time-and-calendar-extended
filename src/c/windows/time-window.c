#include <pebble.h>
#include "include/time-window.h"
#include "../modules/include/calendar_m.h"
#include "../modules/include/bluetooth_m.h"
#include "../modules/include/battery_m.h"
#include "../modules/include/date_m.h"
//#include "../modules/include/time_m.h"
#include "../modules/include/weather_m.h"
#include "../modules/include/health.h"
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
  const GRect bluetooth_bounds = GRect (0, 0, 80, 20);
  const GRect battery_bounds = GRect (bounds.size.w - 47, 0, 52, 20);
  const GRect date_bounds = GRect(0, 22, bounds.size.w, 14);
  //GRect time_bounds = GRect (35, 32, bounds.size.w - 35, 54);
  const GRect calendar_bounds = GRect (2, 92, bounds.size.w, 73);
  GRect weather_bounds = GRect (2, 34, bounds.size.w, 58);

  // Phone IP row is anchored to the bottom of the screen, derived from the
  // window height rather than a per-platform constant. It is only created when
  // there is vertical room below the calendar, so it appears automatically on
  // taller screens (e.g. emery / Pebble Time 2) and is simply absent on the
  // 144x168 platforms where there is no space.
  const int ip_height = 22;
  const int ip_margin = 4;
  const int ip_y = bounds.size.h - ip_height - ip_margin;
  const int calendar_bottom = calendar_bounds.origin.y + calendar_bounds.size.h;
  const bool ip_has_room = ip_y >= calendar_bottom + 2;
  const GRect ip_bounds = GRect(2, ip_y, bounds.size.w, ip_height);

  init_bluetooh_layer(bluetooth_bounds);
  init_battery_layer(battery_bounds);

 // init_time_layer(time_bounds);

  init_calendar_layer(calendar_bounds);
  init_weather_layer(weather_bounds);
  if (ip_has_room) {
    init_ip_layer(ip_bounds);
  }
  if (settings_get_HealthSteps()) {
    init_health_layer(date_bounds);
    layer_add_child(window_layer, get_layer_health());
  } else {
    init_date_layer(date_bounds);
    layer_add_child(window_layer, get_layer_date());
  }
  layer_add_child(window_layer, get_layer_bluetooth());
  layer_add_child(window_layer, get_layer_battery());
  
 // layer_add_child(window_layer, get_layer_time());
  layer_add_child(window_layer, get_layer_calendar());
  layer_add_child(window_layer, get_layer_weather());
  if (get_layer_ip()) {
    layer_add_child(window_layer, get_layer_ip());
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
  if (get_layer_ip()) {
    layer_mark_dirty(get_layer_ip());
  }
}