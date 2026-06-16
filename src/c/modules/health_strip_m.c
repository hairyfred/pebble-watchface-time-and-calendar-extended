#include <pebble.h>
#include "include/health_strip_m.h"
#include "../settings.h"

// A compact heart-rate + steps readout that sits on the date row, flanking the
// centered date: HR on the left, steps (with the footsteps glyph) on the right.
// Only created on wide screens (see time-window.c) where it won't overlap the
// date.
static Layer *s_this_layer = NULL;
static GFont s_statuses_font;
static void prv_populate_health_strip_layer(Layer *, GContext *);

void init_health_strip_layer(GRect rect) {
  s_this_layer = layer_create(rect);
  s_statuses_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_STATUSES_18));
  layer_set_update_proc(s_this_layer, prv_populate_health_strip_layer);
}

void deinit_health_strip_layer() {
  if (s_this_layer) {
    layer_destroy(s_this_layer);
    s_this_layer = NULL;
    fonts_unload_custom_font(s_statuses_font);
  }
}

Layer* get_layer_health_strip() {
  return s_this_layer;
}

static void prv_populate_health_strip_layer(Layer *me, GContext *ctx) {
  settings_get_theme(ctx);
#if defined(PBL_HEALTH)
  GRect b = layer_get_bounds(me);
  GFont font = fonts_get_system_font(FONT_KEY_GOTHIC_14);

  // Heart rate (instantaneous): 0 means no sensor / no recent sample -> "--".
  int hr = (int)health_service_peek_current_value(HealthMetricHeartRateBPM);
  static char hr_txt[16];
  if (hr > 0) {
    snprintf(hr_txt, sizeof(hr_txt), "HR %d", hr);
  } else {
    snprintf(hr_txt, sizeof(hr_txt), "HR --");
  }
  graphics_draw_text(ctx, hr_txt, font, \
      GRect(2, -3, b.size.w / 2 - 2, b.size.h + 4), \
      GTextOverflowModeTrailingEllipsis, GTextAlignmentLeft, NULL);

  // Steps (cumulative today), drawn as [footsteps glyph][number], right-aligned.
  time_t start = time_start_of_today();
  time_t end = time(NULL);
  int steps = 0;
  if (health_service_metric_accessible(HealthMetricStepCount, start, end) & HealthServiceAccessibilityMaskAvailable) {
    steps = (int)health_service_sum_today(HealthMetricStepCount);
  }
  static char steps_txt[16];
  snprintf(steps_txt, sizeof(steps_txt), "%d", steps);

  GSize num_size = graphics_text_layout_get_content_size(steps_txt, font, \
      GRect(0, 0, b.size.w, b.size.h), GTextOverflowModeWordWrap, GTextAlignmentLeft);
  const int icon_w = 18;
  const int num_x = b.size.w - num_size.w - 1;
  const int icon_x = num_x - icon_w;

  // "G" is the footsteps glyph in the statuses font.
  graphics_draw_text(ctx, "G", s_statuses_font, \
      GRect(icon_x, -1, icon_w, b.size.h + 4), \
      GTextOverflowModeWordWrap, GTextAlignmentCenter, NULL);
  graphics_draw_text(ctx, steps_txt, font, \
      GRect(num_x, -3, num_size.w + 2, b.size.h + 4), \
      GTextOverflowModeWordWrap, GTextAlignmentLeft, NULL);
#endif
}
