# ==============================================
# 温言助手 - 情绪检测模块
# 功能：检测输入文本中的情绪风险
# ==============================================

from typing import Dict, List, Tuple, Optional
from data.emotion_words import (
    SWEAR_WORDS, SWEAR_REPLACE, RISKY_WORDS, 
    FRIENDLY_REPLACE, EMOTION_LEVELS
)


class EmotionDetector:
    """情绪检测器 - 分析文本中的情绪风险"""
    
    def __init__(self):
        self.swear_words = SWEAR_WORDS
        self.risky_words = RISKY_WORDS
        self.emotion_levels = EMOTION_LEVELS
        
    def detect(self, text: str) -> Dict:
        """
        检测文本的情绪风险
        
        Args:
            text: 待检测的文本
            
        Returns:
            包含情绪检测结果的字典
        """
        result = {
            "level": "safe",
            "level_name": "安全",
            "level_value": 0,
            "description": "语气友好，可直接发送",
            "risk_details": [],
            "has_swear": False,
            "swear_found": [],
            "emotion_types": []
        }
        
        # 1. 检查脏话/违规词（最高优先级）
        swear_found = self._check_swear_words(text)
        if swear_found:
            result["has_swear"] = True
            result["swear_found"] = swear_found
            result["level"] = "violation"
            result["level_name"] = "违规"
            result["level_value"] = 4
            result["description"] = "包含不文明用语，严禁发送"
            result["risk_details"].append({
                "type": "违规用语",
                "words": swear_found,
                "severity": "严重"
            })
            return result
        
        # 2. 检查情绪风险词
        emotion_types, risk_details = self._check_risky_words(text)
        result["emotion_types"] = emotion_types
        result["risk_details"] = risk_details
        
        # 3. 根据风险类型确定整体等级
        if not emotion_types:
            return result
            
        # 计算最高风险等级
        max_level = self._calculate_max_level(emotion_types)
        result["level"] = max_level["level"]
        result["level_name"] = max_level["name"]
        result["level_value"] = max_level["value"]
        result["description"] = max_level["description"]
        
        return result
    
    def _check_swear_words(self, text: str) -> List[str]:
        """检查是否包含脏话/违规词"""
        found = []
        for swear in self.swear_words:
            if swear in text:
                found.append(swear)
        return found
    
    def _check_risky_words(self, text: str) -> Tuple[List[str], List[Dict]]:
        """检查情绪风险词"""
        emotion_types = []
        risk_details = []
        
        for emotion_type, words in self.risky_words.items():
            found_words = []
            for word in words:
                if word in text:
                    found_words.append(word)
            
            if found_words:
                emotion_types.append(emotion_type)
                severity = self._get_severity(emotion_type)
                risk_details.append({
                    "type": emotion_type,
                    "words": found_words,
                    "severity": severity
                })
        
        return emotion_types, risk_details
    
    def _get_severity(self, emotion_type: str) -> str:
        """根据情绪类型获取严重程度"""
        severity_map = {
            "愤怒": "高",
            "冷漠": "中",
            "嘲讽": "高",
            "质疑": "中",
            "命令": "中",
            "抱怨": "中",
            "随意": "低",
            "不正式": "低"
        }
        return severity_map.get(emotion_type, "中")
    
    def _calculate_max_level(self, emotion_types: List[str]) -> Dict:
        """计算最高风险等级"""
        # 情绪类型到等级的映射
        type_to_level = {
            "愤怒": "moderate",  # 调整为 moderate
            "冷漠": "mild",
            "嘲讽": "moderate",
            "质疑": "mild",
            "命令": "moderate",
            "抱怨": "moderate",
            "随意": "mild",
            "不正式": "mild"
        }
        
        # 统计各等级出现次数
        level_counts = {}
        for emotion_type in emotion_types:
            level = type_to_level.get(emotion_type, "mild")
            level_counts[level] = level_counts.get(level, 0) + 1
        
        # 找到最高等级
        level_priority = ["severe", "moderate", "mild", "safe"]
        for level in level_priority:
            if level in level_counts:
                return {
                    "level": level,
                    "name": self.emotion_levels[level]["description"].split("，")[0].replace("语气", "").replace("包含", "").replace(" ", ""),
                    "value": self.emotion_levels[level]["level"],
                    "description": self.emotion_levels[level]["description"]
                }
        
        return {
            "level": "safe",
            "name": "安全",
            "value": 0,
            "description": "语气友好，可直接发送"
        }
    
    def get_risk_summary(self, text: str) -> str:
        """获取简洁的风险摘要"""
        result = self.detect(text)
        
        if result["level"] == "safe":
            return "✅ 语气友好，可以直接发送"
        elif result["level"] == "violation":
            words = ", ".join(result["swear_found"][:3])
            return f"❌ 包含违规用语：{words}，必须改写"
        else:
            types = ", ".join(result["emotion_types"])
            return f"⚠️ 检测到{types}情绪，建议改写"


class EmotionAnalyzer:
    """情绪分析器 - 提供更详细的情绪分析"""
    
    def __init__(self):
        self.detector = EmotionDetector()
    
    def analyze(self, text: str) -> Dict:
        """
        进行完整的情绪分析
        
        Args:
            text: 待分析的文本
            
        Returns:
            包含完整分析结果的字典
        """
        detection_result = self.detector.detect(text)
        
        return {
            "original_text": text,
            "text_length": len(text),
            "emotion_result": detection_result,
            "suggestions": self._generate_suggestions(detection_result),
            "is_safe_to_send": detection_result["level"] in ["safe", "mild"]
        }
    
    def _generate_suggestions(self, result: Dict) -> List[str]:
        """根据检测结果生成建议"""
        suggestions = []
        
        if result["level"] == "violation":
            suggestions.append("请删除不文明用语，使用更友好的表达")
            suggestions.append("建议：表达情绪时可以使用'我感到...'的句式")
        elif result["level"] == "severe":
            suggestions.append("语气较为激烈，建议软化表达")
            suggestions.append("可以尝试添加'麻烦'、'辛苦'等礼貌用语")
        elif result["level"] == "moderate":
            suggestions.append("建议调整语气，使其更加温和")
            suggestions.append("添加表情符号或语气词可以缓解紧张感")
        elif result["level"] == "mild":
            suggestions.append("整体语气尚可，可以进一步优化")
        
        if "冷漠" in result.get("emotion_types", []):
            suggestions.append("冷漠的表达可能让对方感到不被重视，建议增加关心用语")
        
        if "命令" in result.get("emotion_types", []):
            suggestions.append("命令式语气容易引起反感，建议改为请求式表达")
        
        if "抱怨" in result.get("emotion_types", []):
            suggestions.append("抱怨的语气可能影响关系，建议表达具体需求而非情绪")
        
        return suggestions