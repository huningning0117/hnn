# ==============================================
# 温言助手 - 配置文件
# 功能：存储应用程序配置
# ==============================================

import json
import os
from typing import Dict, Any

# 配置文件路径
CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "settings.json")


class Config:
    """配置管理类"""
    
    # 默认配置
    DEFAULT_CONFIG = {
        "app": {
            "name": "温言助手",
            "version": "1.0.0",
            "description": "情绪识别与友好表达助手"
        },
        "ui": {
            "window_width": 900,
            "window_height": 700,
            "theme": "light",
            "font_family": "Microsoft YaHei UI",
            "font_size": 11
        },
        "emotion": {
            "enable_detection": True,
            "enable_rewrite": True,
            "default_scene": "职场",
            "show_suggestions": True
        },
        "scenes": {
            "职场": {
                "name": "职场",
                "suffix": "，有问题随时沟通～",
                "tone": "professional"
            },
            "朋友": {
                "name": "朋友",
                "suffix": "哦～",
                "tone": "casual"
            },
            "家庭": {
                "name": "家庭",
                "suffix": "，好不好呀～",
                "tone": "warm"
            }
        },
        "notification": {
            "enable_sound": False,
            "enable_popup": True,
            "warning_level": "moderate"
        }
    }
    
    def __init__(self):
        self.config = self.DEFAULT_CONFIG.copy()
        self._load_config()
    
    def _load_config(self):
        """加载配置文件"""
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)
                    self._merge_config(self.config, loaded_config)
            except Exception as e:
                print(f"加载配置文件失败：{e}")
    
    def _merge_config(self, base: Dict, override: Dict):
        """合并配置"""
        for key, value in override.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_config(base[key], value)
            else:
                base[key] = value
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """
        获取配置值
        
        Args:
            key_path: 配置键路径，如 "app.name" 或 "ui.window_width"
            default: 默认值
            
        Returns:
            配置值
        """
        keys = key_path.split(".")
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def set(self, key_path: str, value: Any):
        """
        设置配置值
        
        Args:
            key_path: 配置键路径
            value: 配置值
        """
        keys = key_path.split(".")
        config = self.config
        
        for key in keys[:-1]:
            if key not in config:
                config[key] = {}
            config = config[key]
        
        config[keys[-1]] = value
    
    def save(self):
        """保存配置到文件"""
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, ensure_ascii=False, indent=4)
    
    def reset(self):
        """重置为默认配置"""
        self.config = self.DEFAULT_CONFIG.copy()
        self.save()


# 全局配置实例
config = Config()


# 情绪等级配置
EMOTION_LEVELS = {
    "safe": {
        "level": 0,
        "color": "#4CAF50",
        "icon": "✅",
        "description": "语气友好，可直接发送"
    },
    "mild": {
        "level": 1,
        "color": "#FFC107",
        "icon": "⚠️",
        "description": "语气稍显生硬，建议微调"
    },
    "moderate": {
        "level": 2,
        "color": "#FF9800",
        "icon": "⚠️",
        "description": "语气较为激烈，建议改写"
    },
    "severe": {
        "level": 3,
        "color": "#F44336",
        "icon": "❌",
        "description": "语气严重不当，必须改写"
    },
    "violation": {
        "level": 4,
        "color": "#9C27B0",
        "icon": "🚫",
        "description": "包含违规用语，严禁发送"
    }
}


# 场景配置
SCENES = ["职场", "朋友", "家庭"]


def get_scene_suffix(scene: str) -> str:
    """获取场景后缀"""
    scene_config = config.get(f"scenes.{scene}", {})
    return scene_config.get("suffix", "")


def get_emotion_level_info(level: str) -> Dict:
    """获取情绪等级信息"""
    return EMOTION_LEVELS.get(level, EMOTION_LEVELS["safe"])