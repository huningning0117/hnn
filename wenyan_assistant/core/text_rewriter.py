# ==============================================
# 温言助手 - 语气改写模块
# 功能：将带有情绪的文本改写为友好表达
# ==============================================

from typing import Dict, List, Optional
import re
from data.emotion_words import (
    SWEAR_WORDS, SWEAR_REPLACE, FRIENDLY_REPLACE, 
    SCENE_SUFFIX, RISKY_WORDS
)


class TextRewriter:
    """文本改写器 - 将风险文本改写为友好表达"""
    
    # 支持的场景
    SCENES = ["职场", "朋友", "家庭"]
    
    def __init__(self):
        self.swear_replace = SWEAR_REPLACE
        self.friendly_replace = FRIENDLY_REPLACE
        self.scene_suffix = SCENE_SUFFIX
        self.risky_words = RISKY_WORDS
    
    def rewrite(self, text: str, scene: str = "职场") -> Dict:
        """
        改写文本为友好表达
        
        Args:
            text: 待改写的文本
            scene: 改写场景（职场/朋友/家庭）
            
        Returns:
            包含改写结果的字典
        """
        if scene not in self.SCENES:
            scene = "职场"
        
        original_text = text
        rewrite_steps = []
        
        # 步骤 1: 替换脏话/违规词
        text, swear_replacements = self._replace_swear_words(text, scene)
        if swear_replacements:
            rewrite_steps.append({
                "step": "脏话替换",
                "replacements": swear_replacements
            })
        
        # 步骤 2: 替换风险词为友好表达
        text, friendly_replacements = self._replace_friendly_words(text, scene)
        if friendly_replacements:
            rewrite_steps.append({
                "step": "友好表达替换",
                "replacements": friendly_replacements
            })
        
        # 步骤 3: 添加场景后缀
        suffix = self.scene_suffix.get(scene, "")
        text = text + suffix
        
        return {
            "original": original_text,
            "rewritten": text,
            "scene": scene,
            "steps": rewrite_steps,
            "changed": original_text != text
        }
    
    def _replace_swear_words(self, text: str, scene: str) -> tuple:
        """替换脏话/违规词"""
        replacements = []
        result = text
        
        # 按长度排序，优先替换长词
        sorted_swears = sorted(
            self.swear_replace.keys(), 
            key=len, 
            reverse=True
        )
        
        for swear in sorted_swears:
            if swear in result:
                replacement = self.swear_replace[swear].get(scene, "请文明沟通")
                if swear in result:
                    replacements.append({
                        "original": swear,
                        "replaced": replacement
                    })
                    result = result.replace(swear, replacement)
        
        return result, replacements
    
    def _replace_friendly_words(self, text: str, scene: str) -> tuple:
        """替换风险词为友好表达"""
        replacements = []
        result = text
        replaced_positions = set()  # 记录已替换的位置
        
        # 按长度排序，优先替换长词
        sorted_keywords = sorted(
            self.friendly_replace.keys(),
            key=len,
            reverse=True
        )
        
        for keyword in sorted_keywords:
            # 查找所有匹配位置
            start = 0
            while True:
                pos = result.find(keyword, start)
                if pos == -1:
                    break
                
                # 检查该位置是否已被替换（通过检查重叠）
                keyword_end = pos + len(keyword)
                is_overlapping = False
                for replaced_pos, replaced_len in list(replaced_positions):
                    # 检查是否有重叠
                    if not (pos >= replaced_pos + replaced_len or keyword_end <= replaced_pos):
                        is_overlapping = True
                        break
                
                if not is_overlapping:
                    replacement_dict = self.friendly_replace[keyword]
                    if scene in replacement_dict:
                        replacement = replacement_dict[scene]
                        replacements.append({
                            "original": keyword,
                            "replaced": replacement
                        })
                        result = result[:pos] + replacement + result[keyword_end:]
                        replaced_positions.add((pos, len(replacement)))
                        break
                else:
                    start = pos + 1
        
        return result, replacements
    
    def get_rewrite_suggestions(self, text: str, scene: str = "职场") -> List[str]:
        """获取改写建议"""
        suggestions = []
        
        # 检查脏话
        for swear in SWEAR_WORDS:
            if swear in text:
                suggestions.append(f"❌ 发现不文明用语'{swear}'，建议删除或替换")
        
        # 检查风险词
        for emotion_type, words in self.risky_words.items():
            for word in words:
                if word in text:
                    if word in self.friendly_replace:
                        replacement = self.friendly_replace[word].get(scene, "友好表达")
                        suggestions.append(f"⚠️ '{word}'可改为'{replacement}'")
        
        return suggestions
    
    def batch_rewrite(self, texts: List[str], scene: str = "职场") -> List[Dict]:
        """批量改写文本"""
        return [self.rewrite(text, scene) for text in texts]


class SmartRewriter(TextRewriter):
    """智能改写器 - 提供更智能的改写建议"""
    
    def __init__(self):
        super().__init__()
    
    def smart_rewrite(self, text: str, scene: str = "职场", 
                      preserve_meaning: bool = True) -> Dict:
        """
        智能改写 - 在保持原意的基础上优化语气
        
        Args:
            text: 待改写的文本
            scene: 改写场景
            preserve_meaning: 是否保持原意
            
        Returns:
            改写结果
        """
        result = self.rewrite(text, scene)
        
        # 添加智能建议
        result["smart_suggestions"] = self._generate_smart_suggestions(
            text, result["rewritten"], scene
        )
        
        return result
    
    def _generate_smart_suggestions(self, original: str, rewritten: str, 
                                     scene: str) -> List[str]:
        """生成智能改写建议"""
        suggestions = []
        
        # 如果改写后文本变长了，说明添加了礼貌用语
        if len(rewritten) > len(original):
            suggestions.append("✅ 已添加礼貌用语，语气更友好")
        
        # 根据场景提供额外建议
        if scene == "职场":
            suggestions.append("💡 职场沟通建议：保持专业，表达清晰")
        elif scene == "朋友":
            suggestions.append("💡 朋友沟通建议：轻松自然，适当使用表情")
        elif scene == "家庭":
            suggestions.append("💡 家庭沟通建议：温柔体贴，多表达关心")
        
        return suggestions
    
    def compare_versions(self, text: str, scene: str = "职场") -> Dict:
        """
        比较原版和改写版
        
        Args:
            text: 原始文本
            scene: 场景
            
        Returns:
            比较结果
        """
        result = self.smart_rewrite(text, scene)
        
        return {
            "original": text,
            "rewritten": result["rewritten"],
            "scene": scene,
            "changes": result.get("steps", []),
            "is_better": result["changed"],
            "suggestions": result.get("smart_suggestions", [])
        }