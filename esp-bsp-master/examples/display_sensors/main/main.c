/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: CC0-1.0
 */

#include <stdio.h>
#include "bsp/esp-bsp.h"
#include "esp_log.h"
#include "watch_face.h"

static const char *TAG = "main";
static lv_obj_t *watch_face_obj = NULL;

void app_main(void)
{
    ESP_LOGI(TAG, "Starting display test...");
    bsp_display_start();
    bsp_display_lock(0);

    lv_obj_t *main_scr = lv_screen_active();
    lv_obj_set_style_bg_color(main_scr, lv_color_black(), 0);
    
    ESP_LOGI(TAG, "Initializing watch face...");
    watch_face_obj = watch_face_init(main_scr);
    watch_face_show(watch_face_obj);

    bsp_display_unlock();
    bsp_display_backlight_on();
    
    ESP_LOGI(TAG, "Watch face shown on screen");

    while (1) {
        lv_timer_handler();
        vTaskDelay(pdMS_TO_TICKS(50));  // 改为50ms，更频繁喂狗
    }
}