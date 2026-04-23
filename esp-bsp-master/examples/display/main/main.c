#include <stdio.h>
#include <string.h>
#include <time.h>
#include <math.h>
#include <sys/time.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "lvgl.h"
#include "esp_system.h"
#include "esp_log.h"
#include "bsp/esp32_s3_eye.h"

static const char *TAG = "watch";

// 定义 PI 常量
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

// 表盘参数（缩小表盘，留出边距）
#define DIAL_SIZE 200
#define NUMBER_RADIUS 75
#define CENTER_X (DIAL_SIZE / 2)  // 100
#define CENTER_Y (DIAL_SIZE / 2)  // 100

void app_main(void)
{
    // 初始化显示（包含 LVGL 初始化）
    lv_display_t *disp = bsp_display_start();
    if (disp == NULL) {
        ESP_LOGE(TAG, "Failed to start display");
        return;
    }

    // 打开背光
    bsp_display_backlight_on();

    ESP_LOGI(TAG, "ESP32-S3-EYE Watch Starting");

    // 1. 表盘容器（缩小尺寸，留出边距，禁用滚动）
    lv_obj_t *watch_container = lv_obj_create(lv_scr_act());
    lv_obj_set_size(watch_container, DIAL_SIZE, DIAL_SIZE);
    lv_obj_align(watch_container, LV_ALIGN_CENTER, 0, 0);
    lv_obj_set_style_bg_color(watch_container, lv_color_hex(0x1a1a2e), 0);
    lv_obj_set_style_radius(watch_container, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_pad_all(watch_container, 0, 0);
    lv_obj_set_style_border_width(watch_container, 0, 0);
    // 禁用滚动和滚动条
    lv_obj_set_scrollbar_mode(watch_container, LV_SCROLLBAR_MODE_OFF);
    lv_obj_clear_flag(watch_container, LV_OBJ_FLAG_SCROLLABLE);

    // 2. 中心红点（同步调整位置）
    lv_obj_t *center_dot = lv_obj_create(watch_container);
    lv_obj_set_size(center_dot, 8, 8);
    lv_obj_set_style_bg_color(center_dot, lv_color_hex(0xff4444), 0);
    lv_obj_set_style_radius(center_dot, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_border_width(center_dot, 0, 0);
    lv_obj_align(center_dot, LV_ALIGN_CENTER, 0, 0);
    lv_obj_move_foreground(center_dot);

    // 3. 绘制 12 个数字（白色，半径 85 圆周分布）
    for (int i = 0; i < 12; i++) {
        int hour = (i == 0) ? 12 : i;
        float angle = (i * 30 - 90) * M_PI / 180.0;
        int x = CENTER_X + (int)(NUMBER_RADIUS * cosf(angle)) - 4;
        int y = CENTER_Y + (int)(NUMBER_RADIUS * sinf(angle)) - 8;

        lv_obj_t *label = lv_label_create(watch_container);
        char num_str[3];
        snprintf(num_str, sizeof(num_str), "%d", hour);
        lv_label_set_text(label, num_str);
        lv_obj_set_style_text_color(label, lv_color_white(), 0);
        lv_obj_set_pos(label, x, y);
    }

    ESP_LOGI(TAG, "Watch face created successfully");

    // 主循环
    while (1) {
        lv_timer_handler();
        vTaskDelay(pdMS_TO_TICKS(20));
    }
}
