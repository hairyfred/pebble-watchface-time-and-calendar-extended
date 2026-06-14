#pragma once

#define IP_KEY 5

void init_ip_layer(GRect);
void deinit_ip_layer();
Layer* get_layer_ip();
void ip_set(const char *ip);
