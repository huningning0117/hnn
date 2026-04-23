idf_component_register(SRCS "main.c"
                            "watch_face.c"
                            "fluid_sim.c"
                     INCLUDE_DIRS "."
                     REQUIRES esp_timer driver esp_lcd lvgl esp_event
                     )