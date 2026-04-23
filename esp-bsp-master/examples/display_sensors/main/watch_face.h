/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: CC0-1.0
 */

/**
 * @file watch_face.h
 * @brief 表盘模块：指针、数字、时间更新
 */

#ifndef WATCH_FACE_H
#define WATCH_FACE_H

#include "lvgl.h"

/**
 * @brief 初始化表盘UI
 * @param parent 父对象（通常为屏幕）
 * @return lv_obj_t* 表盘容器对象
 */
lv_obj_t *watch_face_init(lv_obj_t *parent);

/**
 * @brief 显示表盘
 * @param watch_face 表盘对象
 */
void watch_face_show(lv_obj_t *watch_face);

/**
 * @brief 隐藏表盘
 * @param watch_face 表盘对象
 */
void watch_face_hide(lv_obj_t *watch_face);

/**
 * @brief 更新表盘指针角度（每秒调用）
 * @param watch_face 表盘对象
 */
void watch_face_update(lv_obj_t *watch_face);

#endif /* WATCH_FACE_H */