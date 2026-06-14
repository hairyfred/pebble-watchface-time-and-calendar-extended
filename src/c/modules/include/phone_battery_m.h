#pragma once

void init_phone_battery_layer(GRect);
void deinit_phone_battery_layer();
Layer* get_layer_phone_battery();
void phone_battery_set(int percent);
