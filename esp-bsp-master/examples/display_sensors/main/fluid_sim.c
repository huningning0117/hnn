/*
 * SPDX-FileCopyrightText: 2026 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: CC0-1.0
 */

/**
 * @file fluid_sim.c
 * @brief 流体模拟模块实现
 * @details 12个粒子，240x240边界，重力方向跟随加速度计
 *          粒子间斥力、边界反弹，30fps更新
 */

#include "fluid_sim.h"
#include "esp_log.h"
#include <math.h>
#include <stdlib.h>

static const char *TAG = "fluid_sim";

/* 模拟参数 */
#define PARTICLE_COUNT      12
#define CANVAS_WIDTH        240
#define CANVAS_HEIGHT       240
#define PARTICLE_RADIUS     8
#define GRAVITY_STRENGTH    500.0f
#define REPULSION_STRENGTH  200.0f
#define REPULSION_DIST      30.0f
#define DAMPING             0.98f
#define BOUNCE_DAMPING      0.7f
#define DT                  0.033f  /* 30fps ≈ 33ms */

/* 粒子颜色 - 使用LV_COLOR_MAKE宏避免函数调用初始化 */
static const lv_color_t particle_colors[] = {
    LV_COLOR_MAKE(255, 107, 107),  /* 0xff6b6b */
    LV_COLOR_MAKE(78,  205, 196),  /* 0x4ecdc4 */
    LV_COLOR_MAKE(69,  183, 209),  /* 0x45b7d1 */
    LV_COLOR_MAKE(150, 206, 180),  /* 0x96ceb4 */
    LV_COLOR_MAKE(255, 234, 167),  /* 0xffeaa7 */
    LV_COLOR_MAKE(223, 230, 233),  /* 0xdfe6e9 */
    LV_COLOR_MAKE(162, 155, 254),  /* 0xa29bfe */
    LV_COLOR_MAKE(253, 121, 168),  /* 0xfd79a8 */
    LV_COLOR_MAKE(0,   184, 148),  /* 0x00b894 */
    LV_COLOR_MAKE(9,   132, 227),  /* 0x0984e3 */
    LV_COLOR_MAKE(225, 112, 85),   /* 0xe17055 */
    LV_COLOR_MAKE(108, 92,  231),  /* 0x6c5ce7 */
};

/* 粒子结构 */
typedef struct {
    float x, y;       /* 位置 */
    float vx, vy;     /* 速度 */
    lv_obj_t *obj;    /* LVGL对象 */
} particle_t;

/* 流体模拟状态 */
typedef struct {
    lv_obj_t *container;
    particle_t particles[PARTICLE_COUNT];
    float accel_x;
    float accel_y;
} fluid_sim_t;

/**
 * @brief 初始化单个粒子
 */
static void particle_init(particle_t *p, int index)
{
    /* 环形初始位置（避免重叠） */
    float angle = (index * 360.0f / PARTICLE_COUNT) * M_PI / 180.0f;
    float radius = 60.0f;
    p->x = CANVAS_WIDTH / 2.0f + radius * cosf(angle);
    p->y = CANVAS_HEIGHT / 2.0f + radius * sinf(angle);
    p->vx = 0.0f;
    p->vy = 0.0f;
    p->obj = NULL;
}

/**
 * @brief 计算粒子间斥力
 */
static void apply_repulsion(fluid_sim_t *sim)
{
    for (int i = 0; i < PARTICLE_COUNT; i++) {
        for (int j = i + 1; j < PARTICLE_COUNT; j++) {
            float dx = sim->particles[j].x - sim->particles[i].x;
            float dy = sim->particles[j].y - sim->particles[i].y;
            float dist_sq = dx * dx + dy * dy;
            float dist = sqrtf(dist_sq);

            if (dist < REPULSION_DIST && dist > 0.001f) {
                float force = REPULSION_STRENGTH * (1.0f - dist / REPULSION_DIST);
                float fx = (dx / dist) * force;
                float fy = (dy / dist) * force;

                sim->particles[i].vx -= fx * DT;
                sim->particles[i].vy -= fy * DT;
                sim->particles[j].vx += fx * DT;
                sim->particles[j].vy += fy * DT;
            }
        }
    }
}

/**
 * @brief 处理边界碰撞
 */
static void handle_boundary(particle_t *p)
{
    float r = PARTICLE_RADIUS;

    /* 左右边界 */
    if (p->x < r) {
        p->x = r;
        p->vx = -p->vx * BOUNCE_DAMPING;
    } else if (p->x > CANVAS_WIDTH - r) {
        p->x = CANVAS_WIDTH - r;
        p->vx = -p->vx * BOUNCE_DAMPING;
    }

    /* 上下边界 */
    if (p->y < r) {
        p->y = r;
        p->vy = -p->vy * BOUNCE_DAMPING;
    } else if (p->y > CANVAS_HEIGHT - r) {
        p->y = CANVAS_HEIGHT - r;
        p->vy = -p->vy * BOUNCE_DAMPING;
    }
}

lv_obj_t *fluid_sim_init(lv_obj_t *parent)
{
    fluid_sim_t *sim = calloc(1, sizeof(fluid_sim_t));
    if (sim == NULL) {
        ESP_LOGE(TAG, "Failed to allocate fluid_sim_t");
        return NULL;
    }

    sim->accel_x = 0.0f;
    sim->accel_y = 0.2f;  /* 默认轻微向下重力 */

    /* 创建容器 */
    sim->container = lv_obj_create(parent);
    lv_obj_set_size(sim->container, CANVAS_WIDTH, CANVAS_HEIGHT);
    lv_obj_align(sim->container, LV_ALIGN_CENTER, 0, 0);
    lv_obj_set_style_bg_color(sim->container, lv_color_hex(0x0a0a1a), 0);
    lv_obj_set_style_bg_opa(sim->container, LV_OPA_COVER, 0);
    lv_obj_set_style_border_width(sim->container, 0, 0);
    lv_obj_set_style_radius(sim->container, 0, 0);
    lv_obj_set_style_clip_corner(sim->container, true, 0);

    /* 创建粒子对象 */
    for (int i = 0; i < PARTICLE_COUNT; i++) {
        particle_init(&sim->particles[i], i);

        sim->particles[i].obj = lv_obj_create(sim->container);
        lv_obj_set_size(sim->particles[i].obj, PARTICLE_RADIUS * 2, PARTICLE_RADIUS * 2);
        lv_obj_set_style_bg_color(sim->particles[i].obj, particle_colors[i], 0);
        lv_obj_set_style_bg_opa(sim->particles[i].obj, LV_OPA_COVER, 0);
        lv_obj_set_style_radius(sim->particles[i].obj, LV_RADIUS_CIRCLE, 0);
        lv_obj_set_style_border_width(sim->particles[i].obj, 0, 0);

        /* 设置初始位置 */
        lv_obj_set_pos(sim->particles[i].obj,
                      (int32_t)(sim->particles[i].x - PARTICLE_RADIUS),
                      (int32_t)(sim->particles[i].y - PARTICLE_RADIUS));
    }

    lv_obj_add_flag(sim->container, LV_OBJ_FLAG_HIDDEN);

    /* 存储指针到user_data */
    lv_obj_set_user_data(sim->container, sim);

    ESP_LOGI(TAG, "Fluid simulation initialized with %d particles", PARTICLE_COUNT);
    return sim->container;
}

void fluid_sim_show(lv_obj_t *fluid_sim)
{
    if (fluid_sim) {
        lv_obj_clear_flag(fluid_sim, LV_OBJ_FLAG_HIDDEN);
    }
}

void fluid_sim_hide(lv_obj_t *fluid_sim)
{
    if (fluid_sim) {
        lv_obj_add_flag(fluid_sim, LV_OBJ_FLAG_HIDDEN);
    }
}

void fluid_sim_update(lv_obj_t *fluid_sim, float accel_x, float accel_y)
{
    if (!fluid_sim) return;

    fluid_sim_t *sim = (fluid_sim_t *)lv_obj_get_user_data(fluid_sim);
    if (!sim) return;

    /* 更新加速度（限制范围） */
    sim->accel_x = accel_x;
    sim->accel_y = accel_y;
    
    /* 限制加速度范围，避免飞出屏幕 */
    if (sim->accel_x > 2.0f) sim->accel_x = 2.0f;
    if (sim->accel_x < -2.0f) sim->accel_x = -2.0f;
    if (sim->accel_y > 2.0f) sim->accel_y = 2.0f;
    if (sim->accel_y < -2.0f) sim->accel_y = -2.0f;

    /* 物理更新 */
    for (int i = 0; i < PARTICLE_COUNT; i++) {
        particle_t *p = &sim->particles[i];

        /* 应用重力 */
        p->vx += sim->accel_x * GRAVITY_STRENGTH * DT;
        p->vy += sim->accel_y * GRAVITY_STRENGTH * DT;

        /* 应用阻尼 */
        p->vx *= DAMPING;
        p->vy *= DAMPING;

        /* 更新位置 */
        p->x += p->vx * DT;
        p->y += p->vy * DT;

        /* 边界处理 */
        handle_boundary(p);
    }

    /* 粒子间斥力 */
    apply_repulsion(sim);

    /* 更新LVGL对象位置 */
    for (int i = 0; i < PARTICLE_COUNT; i++) {
        particle_t *p = &sim->particles[i];
        lv_obj_set_pos(p->obj,
                      (int32_t)(p->x - PARTICLE_RADIUS),
                      (int32_t)(p->y - PARTICLE_RADIUS));
    }
}