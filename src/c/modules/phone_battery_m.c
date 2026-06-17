#include <pebble.h>
#include "include/phone_battery_m.h"
#include "../settings.h"

// Phone battery % comes from PebbleKit JS via the Web Battery API
// (navigator.getBattery), which is only available on Android. Elsewhere no
// value is ever received and nothing is drawn. Not persisted — a stale phone
// battery reading would be misleading.
static Layer *s_this_layer = NULL;
static int s_percent = -1;
static void prv_populate_phone_battery_layer(Layer *, GContext *);

void init_phone_battery_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  layer_set_update_proc(s_this_layer, prv_populate_phone_battery_layer);
}

void deinit_phone_battery_layer() {
  if (s_this_layer) {
    layer_destroy(s_this_layer);
    s_this_layer = NULL;
  }
}

Layer* get_layer_phone_battery() {
  return s_this_layer;
}

void phone_battery_set(int percent) {
  s_percent = percent;
  if (s_this_layer) {
    layer_mark_dirty(s_this_layer);
  }
}

static GColor prv_foreground_color() {
  int hex = is_time_to_shift() ? settings_get_ShiftFontColor() : settings_get_FontColorHex();
  return GColorFromHEX(hex);
}

static void prv_populate_phone_battery_layer(Layer *me, GContext *ctx) {
  settings_get_theme(ctx);
  if (!settings_get_ShowPhoneBattery()) {
    return;
  }
  if (s_percent < 0) {
    return;
  }
  GRect b = layer_get_bounds(me);
  GColor fg = prv_foreground_color();

  // Old-style telephone handset: two filled bulbs (earpiece + mouthpiece) at a
  // diagonal, connected by a thick handle. Tilts from upper-left to lower-right
  // so it reads as a phone, not a battery.
  const int icon_top = (b.size.h - 16) / 2;
  GPoint ear   = GPoint(2, icon_top + 3);
  GPoint mouth = GPoint(8, icon_top + 13);
  graphics_context_set_fill_color(ctx, fg);
  graphics_fill_circle(ctx, ear, 3);
  graphics_fill_circle(ctx, mouth, 3);
  graphics_context_set_stroke_color(ctx, fg);
  graphics_context_set_stroke_width(ctx, 3);
  graphics_draw_line(ctx, ear, mouth);
  graphics_context_set_stroke_width(ctx, 1);

  static char txt[8];
  snprintf(txt, sizeof(txt), "%d%%", s_percent);
  // y=0 to align baseline with the watch battery % (same font / row).
  graphics_draw_text(ctx, txt, \
      fonts_get_system_font(FONT_KEY_GOTHIC_18), \
      GRect(13, 0, b.size.w - 13, b.size.h), \
      GTextOverflowModeWordWrap, \
      GTextAlignmentLeft, \
      NULL);
}
