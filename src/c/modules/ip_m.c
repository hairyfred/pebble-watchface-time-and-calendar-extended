#include <pebble.h>
#include "include/ip_m.h"
#include "../settings.h"

// Bottom-band panel for the phone's public IP and its ISP, both fetched in one
// PebbleKit JS call (ipwho.is) and relayed via AppMessage. Persisted so they
// show immediately on launch; refreshed when JS responds.
typedef struct {
  char ip[46];  // large enough for an IPv6 string; normally holds IPv4
  char isp[64];
} __attribute__((__packed__)) IpData;

static IpData s_data;
static Layer *s_this_layer = NULL;
static void prv_populate_ip_layer(Layer *, GContext *);

void init_ip_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  layer_set_update_proc(s_this_layer, prv_populate_ip_layer);
  // Old installs persisted only a char[46] IP under IP_KEY; persist_read_data
  // reads the smaller stored size and leaves isp zeroed — a safe migration.
  persist_read_data(IP_KEY, &s_data, sizeof(s_data));
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

static void prv_save() {
  persist_write_data(IP_KEY, &s_data, sizeof(s_data));
}

void ip_set(const char *ip) {
  snprintf(s_data.ip, sizeof(s_data.ip), "%s", ip);
  prv_save();
  if (s_this_layer) {
    layer_mark_dirty(s_this_layer);
  }
}

void isp_set(const char *isp) {
  snprintf(s_data.isp, sizeof(s_data.isp), "%s", isp);
  prv_save();
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
  GRect b = layer_get_bounds(me);
  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_18);
  int line_h = b.size.h / 2;

  if (strlen(s_data.ip) > 0) {
    graphics_draw_text(ctx, s_data.ip, font, \
        GRect(0, -3, b.size.w, line_h + 6), \
        GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  }
  if (strlen(s_data.isp) > 0) {
    graphics_draw_text(ctx, s_data.isp, font, \
        GRect(0, line_h - 3, b.size.w, line_h + 6), \
        GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  }
}
