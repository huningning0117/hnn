#ifndef WATCH_FACE_H
#define WATCH_FACE_H

#include "lvgl.h"
#include <stdbool.h>

// 创建表盘 UI
lv_obj_t* watch_face_create(void);

// 更新时间（简化参数，不再需要 obj 参数）
void watch_face_update_time(int h, int m, int s);

// 检查指针是否已初始化（供 main.c 安全检查使用）
bool watch_face_hands_ready(void);

// 获取刻度数组（供 main.c 模式切换使用）
lv_obj_t** watch_face_get_tick_marks(void);

#endif
