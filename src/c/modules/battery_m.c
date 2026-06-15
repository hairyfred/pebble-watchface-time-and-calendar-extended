#include <pebble.h>
#include "include/battery_m.h"
#include "../settings.h"

static Layer *s_battery_layer;
static GFont statuses_font;
static BatteryChargeState s_battery_level;
static GPath *s_bolt_path;
static void prv_battery_handler(BatteryChargeState);
static void prv_populate_battery_layer(Layer *, GContext *);

// Small lightning bolt shown next to the battery icon while charging.
static const GPathInfo BOLT_PATH_INFO = {
  .num_points = 6,
  .points = (GPoint []) {{4, 0}, {0, 8}, {3, 8}, {2, 14}, {7, 5}, {4, 5}}
};

void init_battery_layer(GRect rect) {
  s_battery_layer = layer_create(rect);
  layer_set_update_proc(s_battery_layer, prv_populate_battery_layer);
  battery_state_service_subscribe(prv_battery_handler);
  prv_battery_handler(battery_state_service_peek());
  statuses_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_STATUSES_18));
  s_bolt_path = gpath_create(&BOLT_PATH_INFO);
}

void deinit_battery_layer() {
    battery_state_service_unsubscribe();
    layer_destroy(s_battery_layer);
    fonts_unload_custom_font(statuses_font);
    gpath_destroy(s_bolt_path);
}

static void prv_battery_handler(BatteryChargeState state) {

if ((state.charge_percent != s_battery_level.charge_percent) || \
    (state.is_charging != s_battery_level.is_charging) || \
    (state.is_plugged != s_battery_level.is_plugged)) {
      APP_LOG(APP_LOG_LEVEL_DEBUG, "battery_changed");
      s_battery_level = state;
      layer_mark_dirty(s_battery_layer);
  }
}

static void prv_populate_battery_layer(Layer *me, GContext *ctx) {
  #if defined (DEBUG) 
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Draw: BATTERY");
  #endif
  static const char* battery_bar[11] = {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":"};
  settings_get_theme(ctx);
  static char percent_text[5];

  GRect bb = layer_get_bounds(me);
  bool is_charging_now = s_battery_level.is_charging || s_battery_level.is_plugged;
  // When charging, reserve the far-left for the bolt so it doesn't overlap the %.
  GRect percent_text_rect = GRect (is_charging_now ? 9 : 0, 0, is_charging_now ? 25 : 34, bb.size.h);
  GRect battery_bar_rect = GRect (34, -2, 24, bb.size.h);

  int battery_bar_index = s_battery_level.charge_percent == 0 ? 0 : s_battery_level.charge_percent / 10;
  snprintf(percent_text, sizeof(percent_text), "%d%%", s_battery_level.charge_percent);
  graphics_draw_text(ctx, percent_text, \
  fonts_get_system_font(FONT_KEY_GOTHIC_18), \
    percent_text_rect, \
    GTextOverflowModeWordWrap, \
    GTextAlignmentRight, NULL);

  // Keep the original battery level-bar icon...
  graphics_draw_text(ctx, battery_bar[battery_bar_index], \
    statuses_font, \
    battery_bar_rect, \
    GTextOverflowModeWordWrap, \
    GTextAlignmentLeft, NULL);

  // ...and add a small lightning bolt to its left while charging/plugged in.
  // gpath fills with the context fill color, so set it to the font color first.
  if (s_battery_level.is_charging || s_battery_level.is_plugged) {
    int fg_hex = is_time_to_shift() ? settings_get_ShiftFontColor() : settings_get_FontColorHex();
    graphics_context_set_fill_color(ctx, GColorFromHEX(fg_hex));
    gpath_move_to(s_bolt_path, GPoint(0, 3));
    gpath_draw_filled(ctx, s_bolt_path);
  }
}

Layer* get_layer_battery() {
    return s_battery_layer;
}
