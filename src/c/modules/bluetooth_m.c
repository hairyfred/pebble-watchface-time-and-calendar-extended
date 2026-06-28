#include <pebble.h>
#include "include/bluetooth_m.h"
#include "../settings.h"
#include "../utils/include/timeutils.h"
#include "../utils/include/vibe.h"
#include "../utils/include/ticktimerhelper.h"
#include "include/phone_battery_m.h"

//static GBitmap *s_bt_icon;
static GFont statuses_font;
static Layer *this_layer;

static void prv_bt_connection_status(bool state);
static void prv_populate_bt_layer(Layer *, GContext *);
static bool init = false;
static bool bt_connected = false;


void init_bluetooh_layer(GRect rect) {
  this_layer = layer_create(rect);
  layer_set_update_proc(this_layer, prv_populate_bt_layer);
  connection_service_subscribe((ConnectionHandlers) {
    .pebble_app_connection_handler = prv_bt_connection_status,
    .pebblekit_connection_handler = NULL,
  });
  statuses_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_STATUSES_18));
  prv_bt_connection_status(connection_service_peek_pebble_app_connection());
 
}

static void prv_bt_connection_status(bool state) { 
#if defined (DEBUG) 
   APP_LOG(APP_LOG_LEVEL_DEBUG, "BT connection status changed");
#endif 
  bt_connected = state;
  if (!init) {    
#if defined (DEBUG) 
      APP_LOG(APP_LOG_LEVEL_DEBUG, "Not inited");
#endif
    return;
  }
    
  if (state) {
    if (settings_get_VibrateConnected()) {
     do_vibrate(settings_get_VibrateConnectedType());
    } 
  } else {
    if (settings_get_VibrateDisconnected()) {
     do_vibrate(settings_get_VibrateDisconnectedType()); 
    }
  }
  layer_mark_dirty(this_layer);
}

static void prv_get_weather_error_symbol(char *err_symbol) {
  switch (settings_get_WeatherStatus()) {
    case WEATHER_API_INVALID:
    case WEATHER_API_NOT_SET:
      snprintf(err_symbol, 2, "%s", "C\0");
      break;
    case WEATHER_LOCATION_ID_INVALID:    
      snprintf(err_symbol, 2, "%s", "U\0");
      break;
    case WEATHER_UNKNOWN_ERROR:
      snprintf(err_symbol, 2, "%s", "F\0");
      break;
    case WEATHER_LOCATION_ERROR:
      snprintf(err_symbol, 2, "%s", "E\0");
      break;
    case WEATHER_API_BANNED:
      snprintf(err_symbol, 2, "%s", "X\0");
      break;
    default:
      snprintf(err_symbol, 2, "%s", " \0");
      break;
}
}

static void prv_populate_bt_layer(Layer *me, GContext *ctx) {
  #if defined (DEBUG) 
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Draw: STATUS LAYER");
  #endif  
  init = true; //do not vibrate on watchface startup.
  settings_get_theme(ctx);
  // Place the BT glyph snug right after the phone battery % text (whose width
  // varies with the digits), so it sits as close to the % as the watch battery
  // % sits to its battery icon. When no phone battery is shown the width is 0
  // and the glyph sits at the far-left. Sub-indicators follow relative to it.
  const int pbw = phone_battery_width();
  const int bt_x = pbw > 0 ? pbw + 2 : 0;
  // The bluetooth "B" glyph inks ~3px higher in the statuses font than the
  // battery digit glyphs do, so to line up level with the watch battery icon
  // (drawn at y=-2) the BT glyph must be drawn ~4px lower, at y=+2. (Measured
  // from statuses.ttf: at the same draw y, "B" inks top=-3 vs the battery
  // digit's top=+1.)
  graphics_draw_text(ctx, bt_connected ? "B" : "A" , \
    statuses_font, \
    GRect (bt_x, 2, 20, 20), \
    GTextOverflowModeWordWrap, \
    GTextAlignmentLeft, \
    NULL);

  // Sub-indicators are PACKED left-to-right from a cursor that starts right
  // after the BT glyph (~16px wide) and only advances when an indicator is
  // actually drawn. This keeps the quiet-time (snooze) glyph snug against the
  // bluetooth icon instead of floating ~40px out into the centered IP when the
  // weather-error slot is empty. y=+1 keeps these icon glyphs level with the
  // battery icon (same reasoning as the BT glyph).
  int sx = bt_x + 18;

  if (settings_get_WeatherStatus() != WEATHER_OK) {
    char weather_err_symbol[2] = {"B"};
    prv_get_weather_error_symbol(weather_err_symbol);
    #if defined (DEBUG)
      APP_LOG(APP_LOG_LEVEL_DEBUG, "weather status %d, BAD status:%s", settings_get_WeatherStatus(), weather_err_symbol);
    #endif
    graphics_draw_text(ctx, weather_err_symbol , \
    statuses_font, \
    GRect (sx, 1, 20, 20), \
    GTextOverflowModeWordWrap, \
    GTextAlignmentCenter, \
    NULL);
    sx += 20;
  }

  if (is_quiet_time()) {
    graphics_draw_text(ctx, "D" , \
    statuses_font, \
    GRect (sx, 1, 20, 20), \
    GTextOverflowModeWordWrap, \
    GTextAlignmentCenter, \
    NULL);
    sx += 20;
  }
  //if (settings_get_ClockFormatSettings() == CF_RESPECT)
  if (strcmp(settings_get_ClockFormat(), "%I:%M") == 0) {
    graphics_draw_text(ctx, get_Time()->tm_hour < 12 ? "AM" : "PM" , \
    fonts_get_system_font(FONT_KEY_GOTHIC_18), \
    GRect (sx, 0, 24, 20), \
    GTextOverflowModeWordWrap, \
    GTextAlignmentCenter, \
    NULL);
  }
}

void deinit_bluetooth_layer() {
  connection_service_unsubscribe();
  fonts_unload_custom_font(statuses_font);
  if (this_layer) {
    layer_destroy(this_layer);
  }
}

Layer* get_layer_bluetooth() {
  return this_layer;
}


bool is_bt_connected() {
  return bt_connected;
}