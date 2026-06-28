#include <pebble.h>
#include "include/ip_m.h"
#include "../settings.h"

// Top-row display of the phone's public IP (compact, GOTHIC_14, centered),
// fetched in PebbleKit JS via ipwho.is/ipapi.co/ipify and relayed via
// AppMessage. The ISP is still received (and persisted) for possible future
// use but is not displayed in the current layout.
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

  // Compact IP for the top row: GOTHIC_14, centered, single line.
  if (strlen(s_data.ip) > 0) {
    // The JS side already sends only an IPv4 address or the short marker
    // "IPv6", but a value persisted by an older build could be a full ~39-char
    // IPv6 string that overflows the row and overlaps the other status glyphs.
    // A colon means IPv6, so collapse any such address to the marker here too.
    const char *ip_disp = strchr(s_data.ip, ':') ? "IPv6" : s_data.ip;
    graphics_draw_text(ctx, ip_disp, fonts_get_system_font(FONT_KEY_GOTHIC_14), \
        GRect(0, 1, b.size.w, b.size.h), \
        GTextOverflowModeTrailingEllipsis, GTextAlignmentCenter, NULL);
  }
}
