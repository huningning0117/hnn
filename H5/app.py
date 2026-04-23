from flask import Flask, render_template, jsonify, send_file
import random
import math
import time
from datetime import datetime
import threading
import json
import os

app = Flask(__name__)

# 实时传感器数据
sensor_data = {
    "acceleration": {"x": 0.0, "y": 0.0, "z": 0.0},
    "angular_velocity": {"x": 0.0, "y": 0.0, "z": 0.0},
    "euler_angle": {"roll": 0.0, "pitch": 0.0, "yaw": 0.0},
    "state": "平放",
    "confidence": 0,
    "duration": 0.0,
    "tilt_angle": 0.0,
    "tilt_direction": "平放"
}

# 历史数据（用于画曲线）
history = {
    "acc_x": [], "acc_y": [], "acc_z": [],
    "gyr_x": [], "gyr_y": [], "gyr_z": [],
    "roll": [], "pitch": [], "yaw": []
}
MAX_POINTS = 50  # 曲线最多保留50个点，自动滚动

# 后台线程：持续生成模拟数据（和老师的曲线走势完全一致）
def update_sensor_data():
    global sensor_data, history
    start_time = time.time()
    while True:
        t = time.time() - start_time
        
        # 1. 生成加速度数据（和老师的Z轴≈1g波动一致）
        acc_x = round(math.sin(t * 1.8) * 0.4 + random.uniform(-0.03, 0.03), 3)
        acc_y = round(math.sin(t * 1.8 + 1.2) * 0.4 + random.uniform(-0.03, 0.03), 3)
        acc_z = round(1.0 + math.sin(t * 2.5) * 0.25 + random.uniform(-0.03, 0.03), 3)
        
        # 2. 生成角速度数据（和老师的±15°/s波动一致）
        gyr_x = round(math.sin(t * 2.8) * 12 + random.uniform(-1.5, 1.5), 1)
        gyr_y = round(math.sin(t * 2.8 + 1.5) * 12 + random.uniform(-1.5, 1.5), 1)
        gyr_z = round(math.sin(t * 2.8 + 3) * 12 + random.uniform(-1.5, 1.5), 1)
        
        # 3. 生成欧拉角（Roll/Pitch/Yaw，和老师的曲线走势一致）
        roll = round(math.sin(t * 1.2) * 18 + random.uniform(-1, 1), 1)
        pitch = round(math.sin(t * 1.2 + 1.8) * 18 + random.uniform(-1, 1), 1)
        yaw = round(math.sin(t * 0.8) * 12 + random.uniform(-1, 1), 1)
        
        # 4. 姿态判定（静止/移动/快速）
        acc_mag = math.sqrt(acc_x**2 + acc_y**2 + (acc_z-1)**2)
        if acc_mag < 0.1:
            state = "平放"
            confidence = round(random.uniform(70, 90), 1)
        elif acc_mag < 0.4:
            state = "移动中"
            confidence = round(random.uniform(60, 80), 1)
        else:
            state = "快速移动"
            confidence = round(random.uniform(80, 95), 1)
        
        # 5. 倾斜角度&方向
        tilt_angle = round(math.sqrt(roll**2 + pitch**2), 1)
        if tilt_angle < 5:
            tilt_direction = "平放"
        elif roll > 0:
            tilt_direction = "右倾"
        else:
            tilt_direction = "左倾"
        
        # 更新实时数据
        sensor_data = {
            "acceleration": {"x": acc_x, "y": acc_y, "z": acc_z},
            "angular_velocity": {"x": gyr_x, "y": gyr_y, "z": gyr_z},
            "euler_angle": {"roll": roll, "pitch": pitch, "yaw": yaw},
            "state": state,
            "confidence": confidence,
            "duration": round(t % 10, 1),  # 持续时间循环0-10s
            "tilt_angle": tilt_angle,
            "tilt_direction": tilt_direction
        }
        
        # 更新历史数据（自动滚动）
        for k, v in zip(history.keys(), [acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z, roll, pitch, yaw]):
            history[k].append(v)
            if len(history[k]) > MAX_POINTS:
                history[k].pop(0)
        
        # 保存到JSON（满足导出需求）
        with open("sensor_data.json", "w", encoding="utf-8") as f:
            json.dump(sensor_data, f, ensure_ascii=False, indent=2)
        
        time.sleep(0.1)  # 100ms刷新一次，和老师的实时效果一致

# 前端页面路由
@app.route('/')
def index():
    return render_template('index.html')

# 数据接口（前端定时拉取）
@app.route('/api/sensor-data')
def get_sensor_data():
    return jsonify({
        "now": sensor_data,
        "history": history,
        "time": datetime.now().strftime("%H:%M:%S")
    })

# 导出JSON接口
@app.route('/api/export-json')
def export_json():
    return send_file("sensor_data.json", as_attachment=True)

if __name__ == '__main__':
    # 启动后台数据生成线程
    threading.Thread(target=update_sensor_data, daemon=True).start()
    # 启动Flask服务器
    app.run(host='127.0.0.1', port=5000, debug=True)