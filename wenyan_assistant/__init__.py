# ==============================================
# 温言助手 - 包初始化文件
# ==============================================

__version__ = "1.0.0"
__author__ = "Wenyan Assistant Team"
__description__ = "情绪识别与友好表达助手"

from .core.emotion_detector import EmotionDetector, EmotionAnalyzer
from .core.text_rewriter import TextRewriter, SmartRewriter
from .config.config import config, EMOTION_LEVELS, SCENES

__all__ = [
    "EmotionDetector",
    "EmotionAnalyzer", 
    "TextRewriter",
    "SmartRewriter",
    "config",
    "EMOTION_LEVELS",
    "SCENES"
]