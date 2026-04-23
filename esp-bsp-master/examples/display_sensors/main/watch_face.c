/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: CC0-1.0
 */

/**
 * @file watch_face.c
 * @brief 简洁表盘模块实现
 * @details 黑色圆形背景，12 个白色刻度点，12 个白色数字
 *          时针白色粗 3 长度 50，分针白色粗 2 长度 70，秒针红色粗 1 长度 85
 *          中心红色小圆点
 */

#include "watch_face.h"
#include "esp_log.h"
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

static const char *TAG = "watch_face";

/* 表盘参数 - 完全符合用户规格 */
#define WATCH_CENTER_X      120
#define WATCH_CENTER_Y      120
#define WATCH_RADIUS        110  // 直径 220，半径 110
#define HOUR_HAND_LENGTH    50   // 时针长度 50
#define MINUTE_HAND_LENGTH  70   // 分针长度 70
#define SECOND_HAND_LENGTH  85   // 秒针长度 85
#define NUMBER_RADIUS       80   // 数字位置半径 80
#define TICK_RADIUS         95   // 刻度点位置半径 95
#define TICK_DOT_SIZE       4    // 刻度点半径 4

/* 颜色定义 - 纯黑背景，白色刻度和数字，红色秒针和中心点 */
#define WATCH_BG_COLOR      lv_color_hex(0x000000)
#define HOUR_HAND_COLOR     lv_color_hex(0xffffff)
#define MINUTE_HAND_COLOR   lv_color_hex(0xffffff)
#define SECOND_HAND_COLOR   lv_color_hex(0xff0000)
#define NUMBER_COLOR        lv_color_hex(0xffffff)
#define TICK_COLOR          lv_color_hex(0xffffff)
#define CENTER_DOT_COLOR    lv_color_hex(0xff0000)

/* 表盘对象结构 */
typedef struct {
    lv_obj_t *container;
    lv_obj_t *hour_line;
    lv_obj_t *minute_line;
    lv_obj_t *second_line;
    lv_obj_t *center_dot;
    lv_obj_t *tick_dots[12];
    lv_obj_t *number_labels[12];
} watch_face_t;

/**
 * @brief 角度转 LVGL 旋转值（LVGL 使用 0.1 度单位，0 度在 12 点方向，顺时针）
 */
static int32_t angle_to_lv(int degrees)
{
    return (int32_t)(degrees * 10);
}

lv_obj_t *watch_face_init(lv_obj_t *parent)
{
    watch_face_t *watch = calloc(1, sizeof(watch_face_t));
    if (!watch) {
        ESP_LOGE(TAG, "Failed to allocate watch_face_t");
        return NULL;
    }

    /* 创建容器 - 黑色圆形 */
    watch->container = lv_obj_create(parent);
    if (!watch->container) {
        ESP_LOGE(TAG, "Failed to create container");
        free(watch);
        return NULL;
    }
    
    lv_obj_set_size(watch->container, 220, 220);  // 直径 220
    lv_obj_align(watch->container, LV_ALIGN_CENTER, 0, 0);
    lv_obj_set_style_bg_color(watch->container, WATCH_BG_COLOR, 0);
    lv_obj_set_style_bg_opa(watch->container, LV_OPA_COVER, 0);
    lv_obj_set_style_border_width(watch->container, 0, 0);
    lv_obj_set_style_radius(watch->container, LV_RADIUS_CIRCLE, 0);
    lv_obj_clear_flag(watch->container, LV_OBJ_FLAG_HIDDEN);

    /* 创建 12 个刻度点 - 预计算坐标避免运行时浮点运算 */
    static const int tick_pos[12][2] = {
        {120, 25}, {144, 40}, {164, 65}, {175, 90}, {164, 115}, {144, 140},
        {120, 145}, {96, 140}, {76, 115}, {65, 90}, {76, 65}, {96, 40}
    };
    for (int i = 0; i < 12; i++) {
        watch->tick_dots[i] = lv_obj_create(watch->container);
        lv_obj_set_size(watch->tick_dots[i], TICK_DOT_SIZE, TICK_DOT_SIZE);
        lv_obj_set_style_bg_color(watch->tick_dots[i], TICK_COLOR, 0);
        lv_obj_set_style_bg_opa(watch->tick_dots[i], LV_OPA_COVER, 0);
        lv_obj_set_style_radius(watch->tick_dots[i], LV_RADIUS_CIRCLE, 0);
        lv_obj_set_style_border_width(watch->tick_dots[i], 0, 0);
        lv_obj_set_pos(watch->tick_dots[i], 
                       tick_pos[i][0] - TICK_DOT_SIZE/2, 
                       tick_pos[i][1] - TICK_DOT_SIZE/2);
    }

    /* 创建 12 个数字标签 - 动态计算坐标（修正角度计算） */
    for (int i = 0; i < 12; i++) {
        int hour = (i == 0) ? 12 : i;
        float angle_deg = i * 30.0f; // 直接使用小时对应的度数
        float angle_rad = (angle_deg - 90.0f) * M_PI / 180.0f; // 调整起始角度
        
        int x = WATCH_CENTER_X + (int)(NUMBER_RADIUS * cosf(angle_rad));
        int y = WATCH_CENTER_Y + (int)(NUMBER_RADIUS * sinf(angle_rad));
        
        watch->number_labels[i] = lv_label_create(watch->container);
        if (!watch->number_labels[i]) {
            ESP_LOGE(TAG, "Failed to create number label %d", i);
            watch->number_labels[i] = NULL;
        }
        char num_str[3];
        snprintf(num_str, sizeof(num_str), "%d", hour);
        lv_label_set_text(watch->number_labels[i], num_str);
        lv_obj_set_style_text_color(watch->number_labels[i], NUMBER_COLOR, 0);
        lv_obj_set_style_text_font(watch->number_labels[i], &lv_font_montserrat_14, 0);
        lv_obj_set_pos(watch->number_labels[i], x - 7, y - 7); // 根据字体大小调整偏移
    }

    /* 创建时针 - 白色，长 50，宽 3 */
    watch->hour_line = lv_line_create(watch->container);
    static lv_point_precise_t hour_pts[2];
    hour_pts[0].x = 0; hour_pts[0].y = -12;  // 尾部
    hour_pts[1].x = 0; hour_pts[1].y = HOUR_HAND_LENGTH;  // 头部 50
    lv_line_set_points(watch->hour_line, hour_pts, 2);
    lv_obj_set_style_line_color(watch->hour_line, HOUR_HAND_COLOR, 0);
    lv_obj_set_style_line_width(watch->hour_line, 3, 0);
    lv_obj_set_style_line_rounded(watch->hour_line, true, 0);
    lv_obj_align(watch->hour_line, LV_ALIGN_CENTER, 0, 0);

    /* 创建分针 - 白色，长 70，宽 2 */
    watch->minute_line = lv_line_create(watch->container);
    static lv_point_precise_t min_pts[2];
    min_pts[0].x = 0; min_pts[0].y = -17;
    min_pts[1].x = 0; min_pts[1].y = MINUTE_HAND_LENGTH;  // 头部 70
    lv_line_set_points(watch->minute_line, min_pts, 2);
    lv_obj_set_style_line_color(watch->minute_line, MINUTE_HAND_COLOR, 0);
    lv_obj_set_style_line_width(watch->minute_line, 2, 0);
    lv_obj_set_style_line_rounded(watch->minute_line, true, 0);
    lv_obj_align(watch->minute_line, LV_ALIGN_CENTER, 0, 0);

    /* 创建秒针 - 红色，长 85，宽 1 */
    watch->second_line = lv_line_create(watch->container);
    static lv_point_precise_t sec_pts[2];
    sec_pts[0].x = 0; sec_pts[0].y = -17;
    sec_pts[1].x = 0; sec_pts[1].y = SECOND_HAND_LENGTH;  // 头部 85
    lv_line_set_points(watch->second_line, sec_pts, 2);
    lv_obj_set_style_line_color(watch->second_line, SECOND_HAND_COLOR, 0);
    lv_obj_set_style_line_width(watch->second_line, 1, 0);
    lv_obj_set_style_line_rounded(watch->second_line, true, 0);
    lv_obj_align(watch->second_line, LV_ALIGN_CENTER, 0, 0);

    /* 创建中心点 - 红色，直径 8 */
    watch->center_dot = lv_obj_create(watch->container);
    lv_obj_set_size(watch->center_dot, 8, 8);
    lv_obj_set_style_bg_color(watch->center_dot, CENTER_DOT_COLOR, 0);
    lv_obj_set_style_bg_opa(watch->center_dot, LV_OPA_COVER, 0);
    lv_obj_set_style_radius(watch->center_dot, LV_RADIUS_CIRCLE, 0);
    lv_obj_set_style_border_width(watch->center_dot, 0, 0);
    lv_obj_align(watch->center_dot, LV_ALIGN_CENTER, 0, 0);

    lv_obj_set_user_data(watch->container, watch);
    ESP_LOGI(TAG, "Watch face initialized successfully");
    return watch->container;
}

void watch_face_show(lv_obj_t *watch_face)
{
    if (watch_face) {
        lv_obj_clear_flag(watch_face, LV_OBJ_FLAG_HIDDEN);
    }
}

void watch_face_hide(lv_obj_t *watch_face)
{
    if (watch_face) {
        lv_obj_add_flag(watch_face, LV_OBJ_FLAG_HIDDEN);
    }
}

void watch_face_update(lv_obj_t *watch_face)
{
    if (!watch_face) return;
    
    watch_face_t *watch = (watch_face_t *)lv_obj_get_user_data(watch_face);
    if (!watch || !watch->hour_line || !watch->minute_line || !watch->second_line) return;
    
    /* 获取当前时间 */
    time_t now;
    struct tm timeinfo;
    time(&now);
    localtime_r(&now, &timeinfo);
    
    int hour = timeinfo.tm_hour % 12;
    int minute = timeinfo.tm_min;
    int second = timeinfo.tm_sec;
    
    /* 计算角度（LVGL: 0 度=12 点，顺时针，单位 0.1 度） */
    int32_t hour_angle = angle_to_lv((hour * 30) + (minute / 2));
    int32_t minute_angle = angle_to_lv(minute * 6);
    int32_t second_angle = angle_to_lv(second * 6);
    
    /* 设置指针旋转 */
    lv_obj_set_style_transform_rotation(watch->hour_line, hour_angle, 0);
    lv_obj_set_style_transform_rotation(watch->minute_line, minute_angle, 0);
    lv_obj_set_style_transform_rotation(watch->second_line, second_angle, 0);
}