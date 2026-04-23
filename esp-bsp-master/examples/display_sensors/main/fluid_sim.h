/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: CC0-1.0
 */

/**
 * @file fluid_sim.h
 * @brief 流体模拟模块：粒子物理、加速度计、30fps动画
 */

#ifndef FLUID_SIM_H
#define FLUID_SIM_H

#include "lvgl.h"

/**
 * @brief 初始化流体模拟UI
 * @param parent 父对象（通常为屏幕）
 * @return lv_obj_t* 流体模拟容器对象
 */
lv_obj_t *fluid_sim_init(lv_obj_t *parent);

/**
 * @brief 显示流体模拟
 * @param fluid_sim 流体模拟对象
 */
void fluid_sim_show(lv_obj_t *fluid_sim);

/**
 * @brief 隐藏流体模拟
 * @param fluid_sim 流体模拟对象
 */
void fluid_sim_hide(lv_obj_t *fluid_sim);

/**
 * @brief 更新流体模拟（每帧调用，约30fps）
 * @param fluid_sim 流体模拟对象
 * @param accel_x X轴加速度（-1.0 ~ 1.0）
 * @param accel_y Y轴加速度（-1.0 ~ 1.0）
 */
void fluid_sim_update(lv_obj_t *fluid_sim, float accel_x, float accel_y);

#endif /* FLUID_SIM_H */