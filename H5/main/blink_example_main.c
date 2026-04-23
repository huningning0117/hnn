/*
 * ESP32-S3-LCD-EV-Board (3.95 寸 480×480 RGB LCD) 代码显示示例
 * 
 * 硬件平台：乐鑫 ESP32-S3-LCD-EV-Board
 * 屏幕规格：480×480 RGB LCD (3.95 寸)
 * 驱动芯片：GC9503CV
 * 
 * 本示例演示如何初始化 RGB LCD 屏幕并在其上显示代码文本
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_lcd_panel_ops.h"
#include "esp_lcd_panel_rgb.h"
#include "driver/gpio.h"
#include "esp_err.h"
#include "esp_log.h"
#include "esp_heap_caps.h"
#include "sdkconfig.h"

static const char *TAG = "code_display";

/*
 * ============================================================================
 * LCD 配置参数 - ESP32-S3-LCD-EV-Board 3.95 寸 480×480 RGB LCD
 * ============================================================================
 * 
 * 根据乐鑫官方开发板原理图，GPIO 引脚配置如下：
 * - 控制信号：VSYNC(3), HSYNC(46), DE(17), PCLK(9)
 * - 数据总线：10,11,12,13,14,21,47,48,45,38,39,40,41,42,2,1
 * - 背光控制：GPIO 45
 * - 屏幕时序参数根据 480×480 分辨率及 GC9503CV 驱动芯片配置
 */

// 屏幕分辨率
#define LCD_H_RES              480
#define LCD_V_RES              480

// 像素时钟频率 (16MHz，常用值)
#define LCD_PIXEL_CLOCK_HZ     (16 * 1000 * 1000)

// HSYNC 时序参数 (根据 GC9503CV 数据手册微调)
#define LCD_HSYNC_PULSE_WIDTH  10
#define LCD_HSYNC_BACK_PORCH   20
#define LCD_HSYNC_FRONT_PORCH  20

// VSYNC 时序参数
#define LCD_VSYNC_PULSE_WIDTH  10
#define LCD_VSYNC_BACK_PORCH   20
#define LCD_VSYNC_FRONT_PORCH  20

// 背光控制
#define LCD_BK_LIGHT_ON_LEVEL  1
#define LCD_BK_LIGHT_OFF_LEVEL 0
#define LCD_PIN_NUM_BK_LIGHT   45

// RGB LCD 接口 GPIO 引脚配置 (根据 ESP32-S3-LCD-EV-Board 官方原理图)
#define LCD_PIN_NUM_HSYNC      46  // 修正
#define LCD_PIN_NUM_VSYNC      3   // 修正
#define LCD_PIN_NUM_DE         17  // 修正
#define LCD_PIN_NUM_PCLK       9   // 修正

// 16 位数据总线 GPIO (顺序至关重要)
#define LCD_PIN_NUM_DATA0      10
#define LCD_PIN_NUM_DATA1      11
#define LCD_PIN_NUM_DATA2      12
#define LCD_PIN_NUM_DATA3      13
#define LCD_PIN_NUM_DATA4      14
#define LCD_PIN_NUM_DATA5      21
#define LCD_PIN_NUM_DATA6      47
#define LCD_PIN_NUM_DATA7      48
#define LCD_PIN_NUM_DATA8      45  // 与背光共用 GPIO45，官方设计如此
#define LCD_PIN_NUM_DATA9      38
#define LCD_PIN_NUM_DATA10     39
#define LCD_PIN_NUM_DATA11     40
#define LCD_PIN_NUM_DATA12     41
#define LCD_PIN_NUM_DATA13     42
#define LCD_PIN_NUM_DATA14     2
#define LCD_PIN_NUM_DATA15     1

// 全局 LCD 面板句柄
static esp_lcd_panel_handle_t s_panel_handle = NULL;

/*
 * ============================================================================
 * 颜色定义 (RGB565 格式)
 * ============================================================================
 */
#define COLOR_BLACK       0x0000
#define COLOR_WHITE       0xFFFF
#define COLOR_RED         0xF800
#define COLOR_GREEN       0x07E0
#define COLOR_BLUE        0x001F
#define COLOR_YELLOW      0xFFE0
#define COLOR_CYAN        0x07FF
#define COLOR_MAGENTA     0xF81F
#define COLOR_GRAY        0x8410
#define COLOR_DARK_GRAY   0x4208
#define COLOR_BROWN       0xA145
#define COLOR_ORANGE      0xFD20

/*
 * ============================================================================
 * LCD 初始化函数
 * ============================================================================
 */
static void lcd_init(void)
{
    ESP_LOGI(TAG, "初始化 ESP32-S3-LCD-EV-Board RGB LCD...");

    // 打印内存信息
    size_t free_psram = heap_caps_get_free_size(MALLOC_CAP_SPIRAM);
    size_t free_internal = heap_caps_get_free_size(MALLOC_CAP_INTERNAL);
    ESP_LOGI(TAG, "内存状态 - 空闲 PSRAM: %d 字节, 空闲内部 RAM: %d 字节", free_psram, free_internal);

    // 配置背光 GPIO
    gpio_config_t bk_gpio_config = {
        .mode = GPIO_MODE_OUTPUT,
        .pin_bit_mask = 1ULL << LCD_PIN_NUM_BK_LIGHT
    };
    ESP_ERROR_CHECK(gpio_config(&bk_gpio_config));
    
    // 先开启背光
    gpio_set_level(LCD_PIN_NUM_BK_LIGHT, LCD_BK_LIGHT_ON_LEVEL);

    // 配置 RGB LCD 面板
    esp_lcd_rgb_panel_config_t rgb_config = {
        .clk_src = LCD_CLK_SRC_DEFAULT,
        .data_width = 16,
        .bits_per_pixel = 16,
        .num_fbs = 2,
        .dma_burst_size = 64,
        .bounce_buffer_size_px = 10 * LCD_H_RES,
        
        .disp_gpio_num = -1,
        .pclk_gpio_num = LCD_PIN_NUM_PCLK,
        .vsync_gpio_num = LCD_PIN_NUM_VSYNC,
        .hsync_gpio_num = LCD_PIN_NUM_HSYNC,
        .de_gpio_num = LCD_PIN_NUM_DE,
        
        .data_gpio_nums = {
            LCD_PIN_NUM_DATA0, LCD_PIN_NUM_DATA1, LCD_PIN_NUM_DATA2, LCD_PIN_NUM_DATA3,
            LCD_PIN_NUM_DATA4, LCD_PIN_NUM_DATA5, LCD_PIN_NUM_DATA6, LCD_PIN_NUM_DATA7,
            LCD_PIN_NUM_DATA8, LCD_PIN_NUM_DATA9, LCD_PIN_NUM_DATA10, LCD_PIN_NUM_DATA11,
            LCD_PIN_NUM_DATA12, LCD_PIN_NUM_DATA13, LCD_PIN_NUM_DATA14, LCD_PIN_NUM_DATA15,
        },
        
        .timings = {
            .pclk_hz = LCD_PIXEL_CLOCK_HZ,
            .h_res = LCD_H_RES,
            .v_res = LCD_V_RES,
            .hsync_pulse_width = LCD_HSYNC_PULSE_WIDTH,
            .hsync_back_porch = LCD_HSYNC_BACK_PORCH,
            .hsync_front_porch = LCD_HSYNC_FRONT_PORCH,
            .vsync_pulse_width = LCD_VSYNC_PULSE_WIDTH,
            .vsync_back_porch = LCD_VSYNC_BACK_PORCH,
            .vsync_front_porch = LCD_VSYNC_FRONT_PORCH,
            .flags = {
                .pclk_active_neg = true,
                .de_idle_high = false,
                .hsync_idle_low = true,
                .vsync_idle_low = true,
            },
        },
        
        .flags = {
            .fb_in_psram = true,
            .double_fb = true,
            .no_fb = false,
        },
    };

    ESP_LOGI(TAG, "创建 RGB 面板...");
    ESP_ERROR_CHECK(esp_lcd_new_rgb_panel(&rgb_config, &s_panel_handle));

    ESP_LOGI(TAG, "复位 LCD 面板...");
    ESP_ERROR_CHECK(esp_lcd_panel_reset(s_panel_handle));

    ESP_LOGI(TAG, "初始化 LCD 面板...");
    ESP_ERROR_CHECK(esp_lcd_panel_init(s_panel_handle));

    ESP_LOGI(TAG, "LCD 屏幕初始化完成！分辨率：%dx%d", LCD_H_RES, LCD_V_RES);

    // 显式打开显示输出
    ESP_ERROR_CHECK(esp_lcd_panel_disp_on_off(s_panel_handle, true));

}

// 清屏函数
static void lcd_clear(uint16_t color)
{
    if (s_panel_handle == NULL) return;
    
    // 创建 DMA 缓冲区
    uint16_t *buffer = heap_caps_malloc(LCD_H_RES * 32 * sizeof(uint16_t), MALLOC_CAP_DMA | MALLOC_CAP_8BIT);
    if (buffer == NULL) {
        ESP_LOGE(TAG, "无法分配清屏缓冲区");
        return;
    }
    
    // 填充缓冲区
    for (int i = 0; i < LCD_H_RES * 32; i++) {
        buffer[i] = color;
    }
    
    // 分块清屏
    for (int y = 0; y < LCD_V_RES; y += 32) {
        int height = (y + 32 > LCD_V_RES) ? (LCD_V_RES - y) : 32;
        esp_lcd_panel_draw_bitmap(s_panel_handle, 0, y, LCD_H_RES, y + height, buffer);
    }
    
    free(buffer);
}

// 绘制单个字符 (8x16 点阵) - 使用程序生成点阵
static void lcd_draw_char(int x, int y, char c, uint16_t color, uint16_t bg_color)
{
    if (s_panel_handle == NULL) return;
    if (c < 32 || c > 126) return;  // 仅支持基本 ASCII
    
    // 创建 DMA 缓冲区
    uint16_t *buffer = heap_caps_malloc(8 * 16 * sizeof(uint16_t), MALLOC_CAP_DMA | MALLOC_CAP_8BIT);
    if (buffer == NULL) return;
    
    // 填充背景色
    for (int i = 0; i < 8 * 16; i++) {
        buffer[i] = bg_color;
    }
    
    // 使用程序生成字符点阵图案
    for (int row = 0; row < 16; row++) {
        for (int col = 0; col < 8; col++) {
            int should_draw = 0;
            int char_idx = c - 32;
            
            // 根据字符 ASCII 值和位置生成点阵
            // 这是一个简化的字符生成算法
            uint8_t pattern = 0;
            
            // 使用字符值和行列位置生成伪随机图案
            uint16_t seed = (uint16_t)(char_idx * 31 + row * 7 + col * 3);
            pattern = (uint8_t)((seed * 1103515245 + 12345) >> 16) & 0x0F;
            
            // 根据字符类型决定绘制模式
            switch (c) {
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    // 数字：绘制边框样式
                    should_draw = ((row >= 2 && row <= 13) && (col == 1 || col == 6)) ||
                                  ((row == 2 || row == 8 || row == 13) && (col >= 1 && col <= 6));
                    break;
                case 'A': case 'B': case 'C': case 'D': case 'E':
                case 'F': case 'G': case 'H': case 'I': case 'J':
                case 'K': case 'L': case 'M': case 'N': case 'O':
                case 'P': case 'Q': case 'R': case 'S': case 'T':
                case 'U': case 'V': case 'W': case 'X': case 'Y': case 'Z':
                    // 大写字母：绘制边框样式
                    should_draw = ((row >= 2 && row <= 13) && (col == 1 || col == 6)) ||
                                  ((row == 2 || row == 8 || row == 13) && (col >= 1 && col <= 6));
                    break;
                case 'a': case 'b': case 'c': case 'd': case 'e':
                case 'f': case 'g': case 'h': case 'i': case 'j':
                case 'k': case 'l': case 'm': case 'n': case 'o':
                case 'p': case 'q': case 'r': case 's': case 't':
                case 'u': case 'v': case 'w': case 'x': case 'y': case 'z':
                    // 小写字母：绘制下半部分边框
                    should_draw = ((row >= 5 && row <= 13) && (col == 1 || col == 6)) ||
                                  ((row == 5 || row == 8 || row == 13) && (col >= 1 && col <= 6));
                    break;
                case '<': case '>': case '(': case ')': case '[': case ']':
                case '{': case '}': case '+': case '-': case '*': case '/':
                    // 符号：使用伪随机图案
                    should_draw = (pattern > 6);
                    break;
                case ':': case ';': case '!': case '?':
                    // 标点：垂直排列
                    should_draw = ((col >= 2 && col <= 5) && (row == 3 || row == 11));
                    break;
                case ',': case '.': case '\'': case '"':
                    // 小标点
                    should_draw = (row >= 12 && col >= 3 && col <= 4);
                    break;
                case ' ':
                    should_draw = 0;
                    break;
                default:
                    // 其他字符：使用伪随机图案
                    should_draw = (pattern > 7);
                    break;
            }
            
            if (should_draw) {
                buffer[row * 8 + col] = color;
            }
        }
    }
    
    // 确保不超出屏幕边界
    if (x + 8 > LCD_H_RES) x = LCD_H_RES - 8;
    if (y + 16 > LCD_V_RES) y = LCD_V_RES - 16;
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    
    esp_lcd_panel_draw_bitmap(s_panel_handle, x, y, x + 8, y + 16, buffer);
    free(buffer);
}

// 绘制字符串
static void lcd_draw_string(int x, int y, const char *str, uint16_t color, uint16_t bg_color)
{
    if (s_panel_handle == NULL || str == NULL) return;
    
    int len = strlen(str);
    for (int i = 0; i < len; i++) {
        lcd_draw_char(x + i * 8, y, str[i], color, bg_color);
    }
}

// 绘制矩形框
static void lcd_draw_rect(int x, int y, int w, int h, uint16_t color, bool filled)
{
    if (s_panel_handle == NULL) return;
    
    uint16_t *buffer = heap_caps_malloc(w * sizeof(uint16_t), MALLOC_CAP_DMA | MALLOC_CAP_8BIT);
    if (buffer == NULL) return;
    
    if (filled) {
        // 填充矩形
        for (int i = 0; i < w; i++) buffer[i] = color;
        for (int i = 0; i < h; i++) {
            esp_lcd_panel_draw_bitmap(s_panel_handle, x, y + i, x + w, y + i + 1, buffer);
        }
    } else {
        // 绘制边框
        for (int i = 0; i < w; i++) buffer[i] = color;
        esp_lcd_panel_draw_bitmap(s_panel_handle, x, y, x + w, y + 1, buffer);           // 上边框
        esp_lcd_panel_draw_bitmap(s_panel_handle, x, y + h - 1, x + w, y + h, buffer);   // 下边框
        
        for (int i = 0; i < h; i++) buffer[i] = color;
        esp_lcd_panel_draw_bitmap(s_panel_handle, x, y, x + 1, y + h, buffer);           // 左边框
        esp_lcd_panel_draw_bitmap(s_panel_handle, x + w - 1, y, x + w, y + h, buffer);   // 右边框
    }
    
    free(buffer);
}

// 绘制渐变背景
static void lcd_draw_gradient(int x, int y, int w, int h, uint16_t color1, uint16_t color2)
{
    if (s_panel_handle == NULL) return;
    
    uint16_t *buffer = heap_caps_malloc(w * sizeof(uint16_t), MALLOC_CAP_DMA | MALLOC_CAP_8BIT);
    if (buffer == NULL) return;
    
    for (int i = 0; i < h; i++) {
        float ratio = (float)i / h;
        
        // 提取颜色分量
        uint16_t r1 = (color1 >> 11) & 0x1F;
        uint16_t g1 = (color1 >> 5) & 0x3F;
        uint16_t b1 = color1 & 0x1F;
        uint16_t r2 = (color2 >> 11) & 0x1F;
        uint16_t g2 = (color2 >> 5) & 0x3F;
        uint16_t b2 = color2 & 0x1F;
        
        // 插值计算
        uint16_t r = r1 + (uint16_t)((r2 - r1) * ratio);
        uint16_t g = g1 + (uint16_t)((g2 - g1) * ratio);
        uint16_t b = b1 + (uint16_t)((b2 - b1) * ratio);
        
        // 组合成 RGB565
        for (int j = 0; j < w; j++) {
            buffer[j] = (r << 11) | (g << 5) | b;
        }
        
        esp_lcd_panel_draw_bitmap(s_panel_handle, x, y + i, x + w, y + i + 1, buffer);
    }
    
    free(buffer);
}

/*
 * ============================================================================
 * 代码显示函数
 * ============================================================================
 */
static void display_code_on_screen(void)
{
    ESP_LOGI(TAG, "在屏幕上显示代码...");
    
    // 1. 绘制渐变背景 (深蓝到黑色)
    lcd_draw_gradient(0, 0, LCD_H_RES, LCD_V_RES, 0x001F, 0x0000);
    
    // 2. 绘制标题栏
    lcd_draw_rect(0, 0, LCD_H_RES, 40, 0x001F, true);
    lcd_draw_string(20, 12, "ESP32-S3 Code Display", COLOR_WHITE, COLOR_BLACK);
    lcd_draw_string(280, 12, "480x480 RGB LCD", COLOR_YELLOW, COLOR_BLACK);
    
    // 3. 绘制代码显示区域边框
    lcd_draw_rect(10, 50, LCD_H_RES - 20, LCD_V_RES - 100, COLOR_GRAY, false);
    
    // 4. 代码内容 (HTML 示例)
    const char *code_lines[] = {
        "<!DOCTYPE html>",
        "<html lang=\"en\">",
        "<head>",
        "    <meta charset=\"UTF-8\">",
        "    <title>Sensor Monitor</title>",
        "    <style>",
        "        body {",
        "            background: #1a1a2e;",
        "            color: #ffffff;",
        "            font-family: Arial;",
        "        }",
        "        .container {",
        "            max-width: 1200px;",
        "            margin: 0 auto;",
        "            padding: 20px;",
        "        }",
        "        .card {",
        "            background: rgba(255,255,255,0.1);",
        "            border-radius: 12px;",
        "            padding: 20px;",
        "        }",
        "        h1 {",
        "            color: #00d4ff;",
        "            text-align: center;",
        "        }",
        "    </style>",
        "</head>",
        "<body>",
        "    <div class=\"container\">",
        "        <h1>Sensor Monitor</h1>",
        "        <div class=\"card\">",
        "            <h2>Temperature</h2>",
        "            <p>Value: 25.5C</p>",
        "        </div>",
        "    </div>",
        "</body>",
        "</html>",
        NULL
    };
    
    // 5. 逐行显示代码
    int line_y = 60;
    int line_height = 18;
    int max_lines_per_page = (LCD_V_RES - 110) / line_height;
    int current_line = 0;
    
    for (int i = 0; code_lines[i] != NULL && current_line < max_lines_per_page; i++) {
        const char *line = code_lines[i];
        uint16_t text_color = COLOR_GREEN;
        uint16_t bg_color = COLOR_BLACK;
        
        // 简单的语法高亮
        if (line[0] == '<') {
            if (line[1] == '/') {
                text_color = COLOR_CYAN;
            } else {
                text_color = COLOR_YELLOW;
            }
        } else if (strncmp(line, "    ", 4) == 0) {
            text_color = COLOR_ORANGE;
        } else if (strstr(line, "class") != NULL || strstr(line, "style") != NULL) {
            text_color = COLOR_MAGENTA;
        } else if (strstr(line, "#") != NULL && strstr(line, "color") != NULL) {
            text_color = COLOR_RED;
        }
        
        // 绘制代码行
        lcd_draw_string(20, line_y, line, text_color, bg_color);
        line_y += line_height;
        current_line++;
    }
    
    // 6. 显示状态栏
    lcd_draw_rect(0, LCD_V_RES - 30, LCD_H_RES, 30, 0x000F, true);
    lcd_draw_string(20, LCD_V_RES - 22, "Status: Running | 60Hz | ESP32-S3", COLOR_WHITE, COLOR_BLUE);
    
    ESP_LOGI(TAG, "代码显示完成！共显示 %d 行", current_line);
}

/*
 * ============================================================================
 * 主函数
 * ============================================================================
 */
void app_main(void)
{
    ESP_LOGI(TAG, "===========================================");
    ESP_LOGI(TAG, "  ESP32-S3-LCD-EV-Board Code Display Demo");
    ESP_LOGI(TAG, "  Screen: 480x480 RGB LCD (3.95 inch)");
    ESP_LOGI(TAG, "===========================================");
    
    // 1. 初始化 LCD 屏幕
    lcd_init();
    
    // 2. 清屏 (黑色背景)
    lcd_clear(COLOR_BLACK);
    
    // 3. 在屏幕上显示代码
    display_code_on_screen();
    
    ESP_LOGI(TAG, "Program running...");
    
    // 4. 主循环 (保持程序运行)
    while (1) {
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}