#include <pebble.h>
#include "include/phone_battery_m.h"
#include "../settings.h"

// Phone battery % comes from PebbleKit JS via the Web Battery API
// (navigator.getBattery), which is only available on Android. Elsewhere no
// value is ever received and nothing is drawn. Not persisted -- a stale phone
// battery reading would be misleading. Renders as a bare percentage next to
// the bluetooth indicators on the left (mirroring the watch battery on the
// right); no icon, intentionally, after a few icon attempts looked worse than
// no icon.
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

int phone_battery_width() {
  if (s_percent < 0 || !settings_get_ShowPhoneBattery()) {
    return 0;
  }
  char txt[8];
  snprintf(txt, sizeof(txt), "%d%%", s_percent);
  GSize sz = graphics_text_layout_get_content_size(txt, \
      fonts_get_system_font(FONT_KEY_GOTHIC_18), \
      GRect(0, 0, 60, 20), GTextOverflowModeWordWrap, GTextAlignmentLeft);
  return sz.w;
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

  static char txt[8];
  snprintf(txt, sizeof(txt), "%d%%", s_percent);
  // Left-aligned so the percentage sits flush at the left screen edge with no
  // blank gap before it. The BT glyph and its sub-indicators are positioned to
  // sit just to the right of this text (see bluetooth_m.c). y=0 keeps the
  // baseline matched with the watch battery % on the opposite side.
  graphics_draw_text(ctx, txt, \
      fonts_get_system_font(FONT_KEY_GOTHIC_18), \
      GRect(0, 0, b.size.w, b.size.h), \
      GTextOverflowModeWordWrap, \
      GTextAlignmentLeft, \
      NULL);
}
