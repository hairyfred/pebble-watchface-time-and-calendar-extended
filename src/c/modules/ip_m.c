#include <pebble.h>
#include "include/ip_m.h"
#include "../settings.h"
#include "../utils/include/textutils.h"

static Layer *s_this_layer = NULL;
static char s_ip[46]; // large enough for an IPv6 string; normally holds IPv4
static void prv_populate_ip_layer(Layer *, GContext *);

void init_ip_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  layer_set_update_proc(s_this_layer, prv_populate_ip_layer);
  persist_read_data(IP_KEY, s_ip, sizeof(s_ip));
}

void deinit_ip_layer() {
  if (s_this_layer) {
    layer_destroy(s_this_layer);
    s_this_layer = NULL;
  }
}

Layer* get_layer_ip() {
  return s_this_layer;
}

void ip_set(const char *ip) {
  snprintf(s_ip, sizeof(s_ip), "%s", ip);
  persist_write_data(IP_KEY, s_ip, sizeof(s_ip));
  if (s_this_layer) {
    layer_mark_dirty(s_this_layer);
  }
}

static void prv_populate_ip_layer(Layer *me, GContext *ctx) {
  #if defined (DEBUG)
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Draw: IP");
  #endif
  settings_get_theme(ctx);
  if (!settings_get_ShowPhoneIP()) {
    return;
  }
  if (strlen(s_ip) == 0) {
    return;
  }
  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_18);
  GRect pretty_rect = get_pretty_rect_for_text(layer_get_bounds(me), font);
  graphics_draw_text(ctx, s_ip, \
      font, \
      pretty_rect, \
      GTextOverflowModeTrailingEllipsis, \
      GTextAlignmentCenter, \
      NULL);
}
