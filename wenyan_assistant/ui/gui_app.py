# ==============================================
# 温言助手 - GUI 桌面应用程序
# 功能：提供友好的图形界面进行情绪检测和语气改写
# ==============================================

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import sys
import os
from PIL import Image, ImageDraw

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.emotion_detector import EmotionDetector, EmotionAnalyzer
from core.text_rewriter import TextRewriter, SmartRewriter


def create_wenyan_icon(size=64):
    """创建温言助手图标（汉字"温"的抽象设计，类似用户提供的图标）"""
    # 创建白色圆形背景
    icon = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(icon)
    
    # 蓝色主色调
    blue_main = (50, 140, 220)   # 主蓝色
    
    # 绘制"温"字的三点水旁（左侧）
    # 上方的点 - 圆形
    draw.ellipse([8, 10, 18, 20], fill=blue_main)
    # 下方的弧形笔画
    draw.ellipse([6, 22, 16, 32], fill=blue_main)
    draw.ellipse([8, 32, 18, 42], fill=blue_main)
    
    # 绘制"温"字右侧部分
    # 顶部横折
    draw.rectangle([22, 10, size-10, 18], fill=blue_main)
    draw.rectangle([size-18, 10, size-10, 28], fill=blue_main)
    
    # 中间的"日"字部分
    draw.rectangle([22, 22, size-10, 38], fill=blue_main)
    # 镂空横线
    draw.rectangle([24, 30, size-12, 34], fill=(255, 255, 255, 0))
    
    # 底部的"皿"字部分
    draw.rectangle([22, 40, size-10, 48], fill=blue_main)
    
    return icon


class WenyanApp:
    """温言助手 GUI 应用程序"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("温言助手")
        self.root.geometry("375x700")
        self.root.resizable(False, False)
        
        # 设置窗口图标
        try:
            icon = create_wenyan_icon(64)
            self.iconphoto(False, tk.PhotoImage(data=icon.tobytes()))
        except Exception:
            pass  # 如果图标设置失败，继续运行
        
        # 初始化核心模块
        self.detector = EmotionDetector()
        self.analyzer = EmotionAnalyzer()
        self.rewriter = SmartRewriter()
        
        # 场景选项
        self.scenes = ["职场", "朋友", "家庭"]
        self.current_scene = tk.StringVar(value="职场")
        
        # 创建界面
        self._create_main_screen()
    
    def _create_main_screen(self):
        """创建主屏幕"""
        # 主框架 - 使用渐变背景色
        main_frame = tk.Frame(self.root, bg="#F0F4FF")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 顶部 Logo 和标题区域
        header_frame = tk.Frame(main_frame, bg="#F0F4FF")
        header_frame.pack(pady=(50, 10))
        
        # Logo 区域（使用圆形背景模拟）
        logo_frame = tk.Frame(header_frame, bg="#F0F4FF")
        logo_frame.pack()
        
        # Logo 图标（用文字模拟）
        logo_label = tk.Label(
            logo_frame,
            text="🌸",
            font=('Microsoft YaHei UI', 48),
            bg="#F0F4FF"
        )
        logo_label.pack()
        
        # 应用标题
        title_label = tk.Label(
            header_frame,
            text="温言助手",
            font=('Microsoft YaHei UI', 32, 'bold'),
            bg="#F0F4FF",
            fg="#1565C0"
        )
        title_label.pack(pady=(10, 5))
        
        # 功能按钮区域
        button_frame = tk.Frame(main_frame, bg="#F0F4FF")
        button_frame.pack(fill=tk.X, padx=20, pady=20)
        
        # 智能对话按钮
        self.smart_chat_btn = self._create_feature_button(
            button_frame, "💬 智能对话", self._open_smart_chat
        )
        self.smart_chat_btn.pack(fill=tk.X, pady=10)
        
        # 日程管理按钮（语气改写）
        self.rewrite_btn = self._create_feature_button(
            button_frame, "📝 语气改写", self._open_rewrite
        )
        self.rewrite_btn.pack(fill=tk.X, pady=10)
        
        # 情绪陪伴按钮（情绪检测）
        self.emotion_btn = self._create_feature_button(
            button_frame, "😊 情绪检测", self._open_emotion
        )
        self.emotion_btn.pack(fill=tk.X, pady=10)
        
        # 底部开启体验按钮
        bottom_frame = tk.Frame(main_frame, bg="#F0F4FF")
        bottom_frame.pack(side=tk.BOTTOM, pady=40)
        
        start_btn = tk.Button(
            bottom_frame,
            text="开启体验",
            font=('Microsoft YaHei UI', 16, 'bold'),
            bg="#42A5F5",
            fg="white",
            activebackground="#1E88E5",
            activeforeground="white",
            relief=tk.FLAT,
            cursor="hand2",
            command=self._open_smart_chat,
            padx=50,
            pady=15,
            borderwidth=0,
            highlightthickness=0
        )
        start_btn.pack()
    
    def _create_feature_button(self, parent, text, command):
        """创建圆角风格的功能按钮"""
        btn = tk.Button(
            parent,
            text=text,
            font=('Microsoft YaHei UI', 15),
            bg="white",
            fg="#37474F",
            activebackground="#E8F5E9",
            activeforeground="#1B5E20",
            relief=tk.FLAT,
            cursor="hand2",
            command=command,
            padx=20,
            pady=18,
            borderwidth=0,
            highlightthickness=0
        )
        return btn
    
    def _open_smart_chat(self):
        """打开智能对话界面"""
        self._open_feature_screen("智能对话", "💬")
    
    def _open_rewrite(self):
        """打开语气改写界面"""
        self._open_feature_screen("语气改写", "📝")
    
    def _open_emotion(self):
        """打开情绪检测界面"""
        self._open_feature_screen("情绪检测", "😊")
    
    def _open_feature_screen(self, title, icon):
        """打开功能界面"""
        # 清除主屏幕
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # 创建功能屏幕框架
        screen_frame = tk.Frame(self.root, bg="#F0F4FF")
        screen_frame.pack(fill=tk.BOTH, expand=True)
        
        # 顶部返回按钮区域
        top_frame = tk.Frame(screen_frame, bg="#F0F4FF")
        top_frame.pack(fill=tk.X, pady=(20, 10))
        
        # 返回按钮
        back_btn = tk.Button(
            top_frame,
            text="← 返回",
            font=('Microsoft YaHei UI', 12),
            bg="white",
            fg="#1976D2",
            activebackground="#E3F2FD",
            activeforeground="#1565C0",
            relief=tk.FLAT,
            cursor="hand2",
            command=self._back_to_main,
            padx=15,
            pady=8,
            borderwidth=0,
            highlightthickness=0
        )
        back_btn.pack(side=tk.LEFT, padx=20)
        
        # 标题
        title_label = tk.Label(
            top_frame,
            text=f"{icon} {title}",
            font=('Microsoft YaHei UI', 20, 'bold'),
            bg="#F0F4FF",
            fg="#1565C0"
        )
        title_label.pack(side=tk.LEFT, padx=15, pady=5)
        
        # 内容区域
        content_frame = tk.Frame(screen_frame, bg="#F0F4FF")
        content_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        if title == "智能对话":
            self._create_smart_chat_content(content_frame)
        elif title == "语气改写":
            self._create_rewrite_content(content_frame)
        elif title == "情绪检测":
            self._create_emotion_content(content_frame)
    
    def _create_smart_chat_content(self, parent):
        """创建智能对话内容"""
        # 对话历史显示
        self.chat_history = scrolledtext.ScrolledText(
            parent,
            font=('Microsoft YaHei UI', 11),
            wrap=tk.WORD,
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            state=tk.DISABLED,
            padx=10,
            pady=10
        )
        self.chat_history.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # 场景选择
        scene_frame = tk.Frame(parent, bg="#F0F4FF")
        scene_frame.pack(fill=tk.X)
        
        scene_label = tk.Label(
            scene_frame,
            text="改写场景：",
            font=('Microsoft YaHei UI', 10),
            bg="#F0F4FF",
            fg="#5C6BC0"
        )
        scene_label.pack(side=tk.LEFT)
        
        scene_combo = ttk.Combobox(
            scene_frame,
            textvariable=self.current_scene,
            values=self.scenes,
            state="readonly",
            width=10
        )
        scene_combo.pack(side=tk.LEFT, padx=(10, 0))
        
        # 输入区域
        input_area = tk.Frame(parent, bg="#F0F4FF")
        input_area.pack(fill=tk.X, pady=(10, 0))
        
        # 使用 scrolledtext 代替普通 Text，确保可以输入
        self.input_text = scrolledtext.ScrolledText(
            input_area,
            height=3,
            font=('Microsoft YaHei UI', 11),
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            wrap=tk.WORD,
            padx=10,
            pady=10
        )
        self.input_text.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 绑定回车键发送消息（禁用默认的回车换行行为）
        self.input_text.bind('<Return>', lambda event: self._send_message())
        
        # 发送按钮
        send_btn = tk.Button(
            input_area,
            text="发送",
            font=('Microsoft YaHei UI', 12, 'bold'),
            bg="#42A5F5",
            fg="white",
            activebackground="#1E88E5",
            activeforeground="white",
            relief=tk.FLAT,
            cursor="hand2",
            command=self._send_message,
            padx=25,
            pady=10,
            borderwidth=0,
            highlightthickness=0
        )
        send_btn.pack(side=tk.RIGHT, padx=(10, 0))
    
    def _create_rewrite_content(self, parent):
        """创建语气改写内容"""
        # 输入框
        input_label = tk.Label(
            parent,
            text="请输入要改写的文字：",
            font=('Microsoft YaHei UI', 11),
            bg="#F0F4FF",
            fg="#37474F"
        )
        input_label.pack(anchor=tk.W)
        
        self.input_text = scrolledtext.ScrolledText(
            parent,
            height=4,
            font=('Microsoft YaHei UI', 11),
            wrap=tk.WORD,
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            padx=10,
            pady=10
        )
        self.input_text.pack(fill=tk.X, pady=(10, 0))
        
        # 场景选择
        scene_label = tk.Label(
            parent,
            text="改写场景：",
            font=('Microsoft YaHei UI', 11),
            bg="#F0F4FF",
            fg="#37474F"
        )
        scene_label.pack(anchor=tk.W, pady=(15, 5))
        
        # 场景按钮组
        button_frame = tk.Frame(parent, bg="#F0F4FF")
        button_frame.pack(fill=tk.X)
        
        for scene in self.scenes:
            btn = tk.Button(
                button_frame,
                text=scene,
                font=('Microsoft YaHei UI', 11),
                bg="white",
                fg="#1976D2",
                activebackground="#E3F2FD",
                activeforeground="#1565C0",
                relief=tk.FLAT,
                cursor="hand2",
                command=lambda s=scene: self._rewrite_with_scene(s),
                padx=15,
                pady=10,
                borderwidth=0,
                highlightthickness=0
            )
            btn.pack(side=tk.LEFT, padx=(0, 8), expand=True, fill=tk.X)
        
        # 结果区域
        result_label = tk.Label(
            parent,
            text="改写结果：",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg="#F0F4FF",
            fg="#1565C0"
        )
        result_label.pack(anchor=tk.W, pady=(20, 5))
        
        self.rewrite_result = scrolledtext.ScrolledText(
            parent,
            height=6,
            font=('Microsoft YaHei UI', 11),
            wrap=tk.WORD,
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            state=tk.DISABLED,
            padx=10,
            pady=10
        )
        self.rewrite_result.pack(fill=tk.BOTH, expand=True)
    
    def _create_emotion_content(self, parent):
        """创建情绪检测内容"""
        # 输入框
        input_label = tk.Label(
            parent,
            text="请输入要检测的文字：",
            font=('Microsoft YaHei UI', 11),
            bg="#F0F4FF",
            fg="#37474F"
        )
        input_label.pack(anchor=tk.W)
        
        self.input_text = scrolledtext.ScrolledText(
            parent,
            height=4,
            font=('Microsoft YaHei UI', 11),
            wrap=tk.WORD,
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            padx=10,
            pady=10
        )
        self.input_text.pack(fill=tk.X, pady=(10, 0))
        
        # 检测按钮
        detect_btn = tk.Button(
            parent,
            text="🔍 检测情绪",
            font=('Microsoft YaHei UI', 13, 'bold'),
            bg="#42A5F5",
            fg="white",
            activebackground="#1E88E5",
            activeforeground="white",
            relief=tk.FLAT,
            cursor="hand2",
            command=self._detect_emotion,
            padx=35,
            pady=12,
            borderwidth=0,
            highlightthickness=0
        )
        detect_btn.pack(pady=(15, 0))
        
        # 结果区域
        result_label = tk.Label(
            parent,
            text="检测结果：",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg="#F0F4FF",
            fg="#1565C0"
        )
        result_label.pack(anchor=tk.W, pady=(20, 5))
        
        self.emotion_result = tk.Label(
            parent,
            text="等待检测...",
            font=('Microsoft YaHei UI', 11),
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            pady=15,
            wraplength=320
        )
        self.emotion_result.pack(fill=tk.X)
        
        # 建议区域
        suggestion_label = tk.Label(
            parent,
            text="沟通建议：",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg="#F0F4FF",
            fg="#1565C0"
        )
        suggestion_label.pack(anchor=tk.W, pady=(15, 5))
        
        self.suggestion_text = scrolledtext.ScrolledText(
            parent,
            height=4,
            font=('Microsoft YaHei UI', 10),
            wrap=tk.WORD,
            bg="white",
            fg="#37474F",
            relief=tk.SOLID,
            borderwidth=1,
            state=tk.DISABLED,
            padx=10,
            pady=10
        )
        self.suggestion_text.pack(fill=tk.X)
    
    def _back_to_main(self):
        """返回主屏幕"""
        for widget in self.root.winfo_children():
            widget.destroy()
        self._create_main_screen()
    
    def _send_message(self):
        """发送消息"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入消息内容")
            return
        
        scene = self.current_scene.get()
        
        # 检测情绪
        detect_result = self.detector.detect(text)
        
        # 改写
        rewrite_result = self.rewriter.smart_rewrite(text, scene)
        
        # 显示结果
        self.chat_history.config(state=tk.NORMAL)
        self.chat_history.delete(1.0, tk.END)
        
        self.chat_history.insert(tk.END, f"你：{text}\n\n", "user")
        self.chat_history.insert(tk.END, f"温言助手：\n", "assistant")
        self.chat_history.insert(tk.END, f"📊 情绪检测：{detect_result['level_name']}\n", "info")
        self.chat_history.insert(tk.END, f"✨ 改写建议：{rewrite_result['rewritten']}\n", "suggestion")
        
        self.chat_history.tag_config("user", foreground="#1565C0", font=('Microsoft YaHei UI', 11, 'bold'))
        self.chat_history.tag_config("assistant", foreground="#1976D2", font=('Microsoft YaHei UI', 11, 'bold'))
        self.chat_history.tag_config("info", foreground="#666666")
        self.chat_history.tag_config("suggestion", foreground="#4CAF50")
        
        self.chat_history.config(state=tk.DISABLED)
        
        # 清空输入框
        self.input_text.delete(1.0, tk.END)
    
    def _rewrite_with_scene(self, scene):
        """按指定场景改写"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入要改写的文字")
            return
        
        result = self.rewriter.smart_rewrite(text, scene)
        
        # 显示结果
        self.rewrite_result.config(state=tk.NORMAL)
        self.rewrite_result.delete(1.0, tk.END)
        
        self.rewrite_result.insert(tk.END, f"原文：{result['original']}\n\n", "original")
        self.rewrite_result.insert(tk.END, f"改写：{result['rewritten']}\n", "rewritten")
        
        self.rewrite_result.tag_config("original", foreground="#666666")
        self.rewrite_result.tag_config("rewritten", foreground="#4CAF50", font=('Microsoft YaHei UI', 11, 'bold'))
        
        self.rewrite_result.config(state=tk.DISABLED)
    
    def _detect_emotion(self):
        """检测情绪"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入要检测的文字")
            return
        
        result = self.detector.detect(text)
        
        # 颜色映射
        color_map = {
            "safe": "#4CAF50",
            "mild": "#FFC107",
            "moderate": "#FF9800",
            "severe": "#F44336",
            "violation": "#9C27B0"
        }
        
        # 图标映射
        icon_map = {
            "safe": "✅",
            "mild": "⚠️",
            "moderate": "⚠️",
            "severe": "❌",
            "violation": "🚫"
        }
        
        icon = icon_map.get(result["level"], "❓")
        level_name = result.get("level_name", "未知")
        description = result.get("description", "")
        
        # 更新显示
        self.emotion_result.config(
            text=f"{icon} {level_name}\n{description}",
            bg=color_map.get(result["level"], "#FFFFFF")
        )
        
        # 更新建议
        suggestions = self.analyzer._generate_suggestions(result)
        
        self.suggestion_text.config(state=tk.NORMAL)
        self.suggestion_text.delete(1.0, tk.END)
        
        if suggestions:
            for i, suggestion in enumerate(suggestions, 1):
                self.suggestion_text.insert(tk.END, f"{i}. {suggestion}\n")
        else:
            self.suggestion_text.insert(tk.END, "💡 语气友好，无需额外建议")
        
        self.suggestion_text.config(state=tk.DISABLED)


def main():
    """主函数"""
    root = tk.Tk()
    app = WenyanApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()