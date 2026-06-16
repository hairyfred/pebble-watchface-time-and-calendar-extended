#pragma once

#define DAILY_FORECAST_KEY 6

void dailyforecast_update(DictionaryIterator *iter, void *context);
void dailyforecast_load();
uint8_t get_daily_forecast_ready();
uint8_t get_daily_forecast_qty();
char* get_daily_forecast_daylabel(int i);
char* get_daily_forecast_condition(int i);
int get_daily_forecast_temperature(int i);
