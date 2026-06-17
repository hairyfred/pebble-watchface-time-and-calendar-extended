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

  // Classic desk telephone silhouette: a horizontal handset (pill) on top, a
  // rounded base body below. Unambiguously a phone, not a battery, not a body
  // part.
  graphics_context_set_fill_color(ctx, fg);
  const int icon_w = 13;
  const int icon_h = 16;
  const int icon_x = 0;
  const int icon_y = (b.size.h - icon_h) / 2;
  // Handset (pill on top): 13 wide, 4 tall, rounded.
  graphics_fill_rect(ctx, GRect(icon_x, icon_y, icon_w, 4), 2, GCornersAll);
  // Two short stubs connecting handset to base (the cradle prongs).
  graphics_fill_rect(ctx, GRect(icon_x + 2, icon_y + 4, 2, 2), 0, GCornerNone);
  graphics_fill_rect(ctx, GRect(icon_x + icon_w - 4, icon_y + 4, 2, 2), 0, GCornerNone);
  // Base body: 13 wide, 8 tall, rounded corners.
  graphics_fill_rect(ctx, GRect(icon_x, icon_y + 6, icon_w, 10), 2, GCornersAll);
  // Keypad slot: punch a dark slot near the top of the base to break the
  // silhouette so the base reads as a phone base, not a solid brick.
  graphics_context_set_fill_color(ctx, GColorFromHEX(is_time_to_shift() ? settings_get_ShiftBackgroundColor() : settings_get_BackgroundColorHex()));
  graphics_fill_rect(ctx, GRect(icon_x + 2, icon_y + 9, icon_w - 4, 1), 0, GCornerNone);
  graphics_fill_rect(ctx, GRect(icon_x + 2, icon_y + 11, icon_w - 4, 1), 0, GCornerNone);
  graphics_fill_rect(ctx, GRect(icon_x + 2, icon_y + 13, icon_w - 4, 1), 0, GCornerNone);

  static char txt[8];
  snprintf(txt, sizeof(txt), "%d%%", s_percent);
  // y=0 to align baseline with the watch battery % (same font / row).
  graphics_draw_text(ctx, txt, \
      fonts_get_system_font(FONT_KEY_GOTHIC_18), \
      GRect(15, 0, b.size.w - 15, b.size.h), \
      GTextOverflowModeWordWrap, \
      GTextAlignmentLeft, \
      NULL);
}
