#pragma once

#define FORECAST_KEY 3

void init_forecast_layer(GRect);
void deinit_forecast_layer();
Layer* get_layer_forecast();
void update_forecast(bool);
void forecast_update(DictionaryIterator *iter, void *context);

void forecast_load();
uint8_t get_forecast_ready();
uint8_t get_forecast_qty();
char* get_forecast_timestamp(int i);
char* get_forecast_condition(int i);
int get_forecast_temperature(int i);