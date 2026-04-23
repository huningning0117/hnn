idf_component_register(SRCS "main.c" "lvgl_demo_ui.c" "watch_face.c"
                    INCLUDE_DIRS "."
                    PRIV_REQUIRES esp32_s3_eye lvgl esp_timer driver)
