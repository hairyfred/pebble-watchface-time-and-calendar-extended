#pragma once

void init_phone_battery_layer(GRect);
void deinit_phone_battery_layer();
Layer* get_layer_phone_battery();
void phone_battery_set(int percent);
// Pixel width of the rendered "NN%" text, or 0 when nothing is shown. Used by
// bluetooth_m to place the BT glyph snug right after the phone battery %.
int phone_battery_width();
