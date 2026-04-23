#include "watch_face.h"
#include "esp_log.h"
#include "lvgl.h"

// 极简表盘 - 暂时不使用
lv_obj_t* watch_face_create(void)
{
    return NULL;
}

void watch_face_update_time(int h, int m, int s)
{
    // 暂时不实现
}

lv_obj_t* watch_face_get_screen(void)
{
    return NULL;
}

lv_obj_t** watch_face_get_tick_marks(void)
{
    return NULL;
}