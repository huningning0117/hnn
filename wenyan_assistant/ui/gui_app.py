# ==============================================
# 温言助手 - GUI 桌面应用程序
# 功能：提供友好的图形界面进行情绪检测和语气改写
# ==============================================

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import sys
import os
from PIL import Image, ImageDraw, ImageTk

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.emotion_detector import EmotionDetector, EmotionAnalyzer
from core.text_rewriter import TextRewriter, SmartRewriter


# ==============================================
# 配色方案 - 现代柔和配色
# ==============================================
class Colors:
    """应用程序配色方案"""
    # 主色调
    PRIMARY = "#6366F1"        # 靛蓝色
    PRIMARY_DARK = "#4F46E5"   # 深靛蓝
    PRIMARY_LIGHT = "#818CF8"  # 浅靛蓝
    
    # 辅助色
    SECONDARY = "#EC4899"      # 粉红色
    SECONDARY_LIGHT = "#F472B6"
    
    # 背景色
    BG_PRIMARY = "#F8FAFC"     # 主背景
    BG_SECONDARY = "#FFFFFF"   # 次级背景
    BG_CARD = "#FFFFFF"        # 卡片背景
    
    # 文字色
    TEXT_PRIMARY = "#1E293B"   # 主要文字
    TEXT_SECONDARY = "#64748B" # 次要文字
    TEXT_MUTED = "#94A3B8"     # 淡色文字
    
    # 状态色
    SUCCESS = "#10B981"        # 成功 - 绿色
    WARNING = "#F59E0B"        # 警告 - 橙色
    DANGER = "#EF4444"         # 危险 - 红色
    INFO = "#3B82F6"           # 信息 - 蓝色
    
    # 语气改写黄色
    REWRITE_YELLOW = "#f5a623" # 黄色 - 语气改写专用
    
    # 渐变相关
    GRADIENT_START = "#667eea"
    GRADIENT_END = "#764ba2"


# ==============================================
# 敏感词列表
# ==============================================
SENSITIVE_WORDS = [
    "有病", "傻逼", "笨蛋", "滚", "去死", "废物", "蠢货", "脑残",
    "智障", "白痴", "傻 X", "SB", "B 罩", "滚蛋", "滚开", "闭嘴",
    "烦死了", "恶心", "讨厌", "垃圾", "低能", "窝囊废", "饭桶",
    "混蛋", "混账", "王八蛋", "兔崽子", "畜生", "狗东西", "杂种"
]


def check_sensitive_words(text):
    """检测文本是否包含敏感词
    返回：(is_sensitive, found_words)
    """
    found_words = []
    for word in SENSITIVE_WORDS:
        if word in text:
            found_words.append(word)
    return len(found_words) > 0, found_words


def create_gradient_frame(parent, start_color, end_color, width=375, height=100):
    """创建渐变背景框架"""
    # 创建 PIL 图像用于渐变
    img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    for y in range(height):
        ratio = y / height if height > 0 else 0
        r = int(int(start_color[1:3], 16) * (1 - ratio) + int(end_color[1:3], 16) * ratio)
        g = int(int(start_color[3:5], 16) * (1 - ratio) + int(end_color[3:5], 16) * ratio)
        b = int(int(start_color[5:7], 16) * (1 - ratio) + int(end_color[5:7], 16) * ratio)
        color = (r, g, b, 255)
        draw.line([(0, y), (width, y)], fill=color)
    
    return img


class ModernButton(tk.Canvas):
    """现代风格按钮 - 支持圆角和悬停效果"""
    
    def __init__(self, parent, text="", command=None, width=200, height=50,
                 bg=Colors.PRIMARY, fg="white", radius=12, font=None, **kwargs):
        super().__init__(parent, width=width, height=height, 
                        bg=Colors.BG_PRIMARY, highlightthickness=0, **kwargs)
        
        self.text = text
        self.command = command
        self.bg = bg
        self.fg = fg
        self.radius = radius
        self.hover_bg = self._lighten_color(bg, 1.1)
        self.pressed_bg = self._darken_color(bg, 0.9)
        self.current_bg = bg
        self.width = width
        self.height = height
        
        if font is None:
            font = ('Microsoft YaHei UI', 12, 'bold')
        self.font = font
        
        self._draw_button()
        self._bind_events()
    
    def _lighten_color(self, hex_color, factor):
        """ lighten color """
        r = min(255, int(int(hex_color[1:3], 16) * factor))
        g = min(255, int(int(hex_color[3:5], 16) * factor))
        b = min(255, int(int(hex_color[5:7], 16) * factor))
        return "#{:02x}{:02x}{:02x}".format(r, g, b)
    
    def _darken_color(self, hex_color, factor):
        """ darken color """
        r = max(0, int(int(hex_color[1:3], 16) * factor))
        g = max(0, int(int(hex_color[3:5], 16) * factor))
        b = max(0, int(int(hex_color[5:7], 16) * factor))
        return "#{:02x}{:02x}{:02x}".format(r, g, b)
    
    def _draw_button(self):
        """绘制按钮"""
        self.delete("all")
        
        # 绘制圆角矩形
        self._draw_rounded_rect(0, 0, self.width, self.height, self.radius, fill=self.current_bg)
        
        # 绘制文字
        self.create_text(self.width // 2, self.height // 2, 
                        text=self.text, fill=self.fg, font=self.font)
    
    def _draw_rounded_rect(self, x1, y1, x2, y2, radius, **kwargs):
        """绘制圆角矩形"""
        p = radius
        
        # 创建圆角路径
        points = [
            x1 + p, y1,
            x2 - p, y1,
            x2, y1,
            x2, y1 + p,
            x2, y2 - p,
            x2, y2,
            x2 - p, y2,
            x1 + p, y2,
            x1, y2,
            x1, y2 - p,
            x1, y1 + p,
            x1, y1,
            x1 + p, y1,
        ]
        
        self.create_polygon(points, smooth=True, **kwargs)
    
    def _bind_events(self):
        """绑定事件"""
        self.bind("<Enter>", self._on_enter)
        self.bind("<Leave>", self._on_leave)
        self.bind("<Button-1>", self._on_click)
        self.bind("<ButtonRelease-1>", self._on_release)
    
    def _on_enter(self, event):
        self.current_bg = self.hover_bg
        self._draw_button()
    
    def _on_leave(self, event):
        self.current_bg = self.bg
        self._draw_button()
    
    def _on_click(self, event):
        self.current_bg = self.pressed_bg
        self._draw_button()
        if self.command:
            self.command()
    
    def _on_release(self, event):
        self.current_bg = self.hover_bg
        self._draw_button()


def create_wenyan_icon(size=64):
    """创建温言助手图标（现代化设计）"""
    icon = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(icon)
    
    # 渐变蓝色
    main_color = (99, 102, 241)  # 靛蓝色
    
    # 绘制圆形背景
    draw.ellipse([4, 4, size-4, size-4], fill=(*main_color, 255))
    
    # 绘制简化的"温"字抽象图案
    # 三点水旁
    draw.ellipse([12, 14, 22, 24], fill=(255, 255, 255, 255))
    draw.ellipse([10, 26, 20, 36], fill=(255, 255, 255, 255))
    
    # 右侧部分
    draw.rectangle([26, 14, size-10, 20], fill=(255, 255, 255, 255))
    draw.rectangle([size-14, 14, size-10, 28], fill=(255, 255, 255, 255))
    draw.rectangle([26, 24, size-10, 34], fill=(255, 255, 255, 255))
    draw.rectangle([28, 30, size-12, 32], fill=(99, 102, 241, 255))
    
    # 底部
    draw.rectangle([26, 38, size-10, 44], fill=(255, 255, 255, 255))
    
    return icon


class CardFrame(tk.Frame):
    """卡片风格框架"""
    
    def __init__(self, parent, bg=Colors.BG_CARD, radius=16, **kwargs):
        super().__init__(parent, bg=bg, **kwargs)
        self.radius = radius
        
        # 创建阴影效果（通过边框模拟）
        self.configure(relief=tk.FLAT, bd=0)


class WenyanApp:
    """温言助手 GUI 应用程序 - 现代化设计"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("温言助手")
        self.root.geometry("400x720")
        self.root.resizable(False, False)
        
        # 设置窗口背景色
        self.root.configure(bg=Colors.BG_PRIMARY)
        
        # 设置窗口图标
        try:
            icon = create_wenyan_icon(64)
            self.iconphoto(False, tk.PhotoImage(data=icon.tobytes()))
        except Exception:
            pass
        
        # 初始化核心模块
        self.detector = EmotionDetector()
        self.analyzer = EmotionAnalyzer()
        self.rewriter = SmartRewriter()
        
        # 场景选项
        self.scenes = ["职场", "朋友", "家庭"]
        self.current_scene = tk.StringVar(value="职场")
        
        # 当前屏幕
        self.current_screen = None
        
        # 创建界面
        self._create_main_screen()
    
    def _create_main_screen(self):
        """创建主屏幕"""
        self.current_screen = "main"
        
        # 清除现有内容
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # 顶部渐变头部
        header_height = 180
        header_canvas = tk.Canvas(self.root, height=header_height, 
                                  bg=Colors.PRIMARY, highlightthickness=0)
        header_canvas.pack(fill=tk.X)
        
        # 绘制渐变背景
        gradient_img = create_gradient_frame(header_canvas, Colors.PRIMARY, Colors.PRIMARY_DARK, 
                                            400, header_height)
        gradient_photo = ImageTk.PhotoImage(gradient_img)
        header_canvas.create_image(0, 0, anchor=tk.NW, image=gradient_photo)
        header_canvas.gradient_photo = gradient_photo  # 保持引用
        
        # Logo 和标题
        logo_text = "🌸"
        header_canvas.create_text(200, 70, text=logo_text, 
                                  font=('Microsoft YaHei UI', 56), fill="white")
        
        title_text = "温言助手"
        header_canvas.create_text(200, 135, text=title_text,
                                  font=('Microsoft YaHei UI', 32, 'bold'), fill="white")
        
        # 副标题
        subtitle_text = "让沟通更温暖，让表达更友善"
        header_canvas.create_text(200, 165, text=subtitle_text,
                                  font=('Microsoft YaHei UI', 10), fill="#E0E0E0")
        
        # 主内容区域
        main_frame = tk.Frame(self.root, bg=Colors.BG_PRIMARY)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # 功能卡片
        self._create_feature_card(
            main_frame, "💬 智能对话", 
            "情绪检测 + 语气改写",
            Colors.PRIMARY, self._open_smart_chat
        )
        
        self._create_feature_card(
            main_frame, "📝 语气改写",
            "让文字更得体",
            Colors.REWRITE_YELLOW, self._open_rewrite
        )
        
        self._create_feature_card(
            main_frame, "😊 情绪检测",
            "理解情绪，改善沟通",
            Colors.SUCCESS, self._open_emotion
        )
        
        # 底部信息
        footer_label = tk.Label(
            main_frame,
            text="温言助手 V2.0",
            font=('Microsoft YaHei UI', 9),
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_MUTED
        )
        footer_label.pack(side=tk.BOTTOM, pady=20)
    
    def _create_feature_card(self, parent, title, subtitle, color, command):
        """创建功能卡片"""
        # 整个卡片作为可点击容器
        card = tk.Frame(parent, bg=Colors.BG_CARD, relief=tk.FLAT, bd=0, cursor="hand2")
        card.pack(fill=tk.X, pady=8)
        
        # 左侧彩色条
        color_bar = tk.Frame(card, bg=color, width=4, height=80)
        color_bar.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 15))
        
        # 内容区域
        content_frame = tk.Frame(card, bg=Colors.BG_CARD)
        content_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, pady=12)
        
        # 标题
        title_label = tk.Label(
            content_frame,
            text=title,
            font=('Microsoft YaHei UI', 15, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        title_label.pack(anchor=tk.W)
        
        # 副标题
        subtitle_label = tk.Label(
            content_frame,
            text=subtitle,
            font=('Microsoft YaHei UI', 10),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_SECONDARY
        )
        subtitle_label.pack(anchor=tk.W, pady=(4, 0))
        
        # 右侧按钮区域
        button_frame = tk.Frame(card, bg=Colors.BG_CARD)
        button_frame.pack(side=tk.RIGHT, padx=(15, 15))
        
        # 视觉明显的按钮
        action_button = tk.Label(
            button_frame,
            text="进入 →",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=color,
            fg="white",
            padx=20,
            pady=10,
            relief=tk.FLAT,
            cursor="hand2"
        )
        action_button.pack()
        
        # 绑定点击事件 - 整个卡片可点击
        card.bind("<Button-1>", lambda e: command())
        action_button.bind("<Button-1>", lambda e: command())
        card.bind("<Enter>", lambda e: self._on_card_enter(card, color))
        card.bind("<Leave>", lambda e: self._on_card_leave(card))
        
        # 保存引用以便后续恢复
        card.original_color = Colors.BG_CARD
        card.hover_color = self._lighten_color_hex(Colors.BG_CARD, 0.98)
        card.color = color
        card.action_button = action_button  # 保存按钮引用
        
        return card
    
    def _lighten_color_hex(self, hex_color, factor):
        """Lighten hex color"""
        r = min(255, int(int(hex_color[1:3], 16) * factor))
        g = min(255, int(int(hex_color[3:5], 16) * factor))
        b = min(255, int(int(hex_color[5:7], 16) * factor))
        return "#{:02x}{:02x}{:02x}".format(r, g, b)
    
    def _darken_color_hex(self, hex_color, factor):
        """Darken hex color"""
        r = max(0, int(int(hex_color[1:3], 16) * factor))
        g = max(0, int(int(hex_color[3:5], 16) * factor))
        b = max(0, int(int(hex_color[5:7], 16) * factor))
        return "#{:02x}{:02x}{:02x}".format(r, g, b)
    
    def _on_card_enter(self, card, color):
        """卡片悬停效果"""
        # 简化悬停效果，使用轻微变亮的背景
        card.configure(bg="#F0F4F8")  # 轻微变亮的背景色
    
    def _on_card_leave(self, card):
        """卡片离开效果"""
        card.configure(bg=Colors.BG_CARD)
    
    def _open_smart_chat(self):
        """打开智能对话界面"""
        self._open_feature_screen("智能对话", "💬", Colors.PRIMARY)
    
    def _open_rewrite(self):
        """打开语气改写界面"""
        self._open_feature_screen("语气改写", "📝", Colors.REWRITE_YELLOW)
    
    def _open_emotion(self):
        """打开情绪检测界面"""
        self._open_feature_screen("情绪检测", "😊", Colors.SUCCESS)
    
    def _open_feature_screen(self, title, icon, color):
        """打开功能界面"""
        self.current_screen = title
        
        # 清除主屏幕
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # 顶部导航栏
        nav_frame = tk.Frame(self.root, bg=color, height=60)
        nav_frame.pack(fill=tk.X)
        
        # 返回按钮
        back_btn = tk.Button(
            nav_frame,
            text="←",
            font=('Microsoft YaHei UI', 18, 'bold'),
            bg=color,
            fg="white",
            activebackground=self._darken_color_hex(color, 0.9),
            activeforeground="white",
            relief=tk.FLAT,
            command=self._back_to_main,
            width=3,
            pady=10
        )
        back_btn.pack(side=tk.LEFT, padx=15, pady=10)
        
        # 标题
        title_label = tk.Label(
            nav_frame,
            text=f"{icon} {title}",
            font=('Microsoft YaHei UI', 18, 'bold'),
            bg=color,
            fg="white"
        )
        title_label.pack(side=tk.LEFT, padx=15, pady=15)
        
        # 主内容区域
        main_frame = tk.Frame(self.root, bg=Colors.BG_PRIMARY)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=16)
        
        if title == "智能对话":
            self._create_smart_chat_content(main_frame, color)
        elif title == "语气改写":
            self._create_rewrite_content(main_frame, color)
        elif title == "情绪检测":
            self._create_emotion_content(main_frame, color)
    
    def _create_card_container(self, parent, height=None):
        """创建卡片容器"""
        card = tk.Frame(parent, bg=Colors.BG_CARD, relief=tk.FLAT, bd=0)
        card.pack(fill=tk.X, pady=8)
        
        inner_frame = tk.Frame(card, bg=Colors.BG_CARD)
        inner_frame.pack(fill=tk.BOTH, expand=True if height is None else False, padx=16, pady=12)
        
        if height:
            inner_frame.pack_propagate(False)
            inner_frame.config(height=height)
        
        return card, inner_frame
    
    def _create_smart_chat_content(self, parent, color):
        """创建智能对话内容"""
        # 对话历史显示卡片
        chat_card, chat_frame = self._create_card_container(parent)
        
        chat_label = tk.Label(
            chat_frame,
            text="💭 对话记录",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        chat_label.pack(anchor=tk.W, pady=(0, 10))
        
        self.chat_history = scrolledtext.ScrolledText(
            chat_frame,
            font=('Microsoft YaHei UI', 10),
            wrap=tk.WORD,
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_PRIMARY,
            relief=tk.FLAT,
            borderwidth=0,
            state=tk.DISABLED,
            padx=12,
            pady=12,
            highlightthickness=0
        )
        self.chat_history.pack(fill=tk.BOTH, expand=True)
        
        # 场景选择
        scene_frame = tk.Frame(parent, bg=Colors.BG_PRIMARY)
        scene_frame.pack(fill=tk.X, pady=(12, 0))
        
        scene_label = tk.Label(
            scene_frame,
            text="改写场景",
            font=('Microsoft YaHei UI', 10),
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_SECONDARY
        )
        scene_label.pack(side=tk.LEFT)
        
        # 自定义场景选择器
        scene_combo_frame = tk.Frame(scene_frame, bg=Colors.BG_CARD)
        scene_combo_frame.pack(side=tk.LEFT, padx=(10, 0))
        
        scene_combo = ttk.Combobox(
            scene_combo_frame,
            textvariable=self.current_scene,
            values=self.scenes,
            state="readonly",
            width=8,
            font=('Microsoft YaHei UI', 10)
        )
        scene_combo.pack()
        
        # 输入区域卡片
        input_card, input_frame = self._create_card_container(parent)
        
        # 使用 scrolledtext 代替普通 Text
        self.input_text = scrolledtext.ScrolledText(
            input_frame,
            height=3,
            font=('Microsoft YaHei UI', 10),
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_PRIMARY,
            relief=tk.FLAT,
            borderwidth=0,
            wrap=tk.WORD,
            padx=12,
            pady=12,
            highlightthickness=0
        )
        self.input_text.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 发送按钮
        send_btn = tk.Button(
            input_frame,
            text="发送",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=color,
            fg="white",
            activebackground=self._darken_color_hex(color, 0.9),
            activeforeground="white",
            relief=tk.FLAT,
            command=self._send_message,
            padx=20,
            pady=10,
            borderwidth=0,
            cursor="hand2"
        )
        send_btn.pack(side=tk.RIGHT, padx=(10, 0))
        
        # 绑定回车键
        self.input_text.bind('<Return>', lambda e: self._send_message())
    
    def _create_rewrite_content(self, parent, color):
        """创建语气改写内容"""
        # 输入卡片
        input_card, input_frame = self._create_card_container(parent)
        
        input_label = tk.Label(
            input_frame,
            text="📝 输入要改写的文字",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        input_label.pack(anchor=tk.W, pady=(0, 10))
        
        self.input_text = scrolledtext.ScrolledText(
            input_frame,
            height=4,
            font=('Microsoft YaHei UI', 10),
            wrap=tk.WORD,
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_PRIMARY,
            relief=tk.FLAT,
            borderwidth=0,
            padx=12,
            pady=12,
            highlightthickness=0
        )
        self.input_text.pack(fill=tk.X)
        
        # 场景选择卡片
        scene_card, scene_frame = self._create_card_container(parent)
        
        scene_title = tk.Label(
            scene_frame,
            text="选择改写场景",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        scene_title.pack(anchor=tk.W, pady=(0, 10))
        
        # 场景按钮组
        button_frame = tk.Frame(scene_frame, bg=Colors.BG_CARD)
        button_frame.pack(fill=tk.X)
        
        for scene in self.scenes:
            btn = tk.Button(
                button_frame,
                text=scene,
                font=('Microsoft YaHei UI', 11),
                bg=Colors.BG_PRIMARY,
                fg=Colors.TEXT_SECONDARY,
                activebackground=color,
                activeforeground="white",
                relief=tk.FLAT,
                command=lambda s=scene: self._rewrite_with_scene(s),
                padx=15,
                pady=12,
                borderwidth=0,
                cursor="hand2"
            )
            btn.pack(side=tk.LEFT, padx=(0, 8), expand=True, fill=tk.X)
            
            # 设置初始选中状态
            if scene == "职场":
                btn.configure(bg=color, fg="white")
        
        # 结果卡片
        result_card, result_frame = self._create_card_container(parent, height=150)
        
        result_title = tk.Label(
            result_frame,
            text="✨ 改写结果",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        result_title.pack(anchor=tk.W, pady=(0, 10))
        
        self.rewrite_result = scrolledtext.ScrolledText(
            result_frame,
            font=('Microsoft YaHei UI', 10),
            wrap=tk.WORD,
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_PRIMARY,
            relief=tk.FLAT,
            borderwidth=0,
            state=tk.DISABLED,
            padx=12,
            pady=12,
            highlightthickness=0
        )
        self.rewrite_result.pack(fill=tk.BOTH, expand=True)
    
    def _create_emotion_content(self, parent, color):
        """创建情绪检测内容"""
        # 输入卡片
        input_card, input_frame = self._create_card_container(parent)
        
        input_label = tk.Label(
            input_frame,
            text="😊 输入要检测的文字",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        input_label.pack(anchor=tk.W, pady=(0, 10))
        
        self.input_text = scrolledtext.ScrolledText(
            input_frame,
            height=4,
            font=('Microsoft YaHei UI', 10),
            wrap=tk.WORD,
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_PRIMARY,
            relief=tk.FLAT,
            borderwidth=0,
            padx=12,
            pady=12,
            highlightthickness=0
        )
        self.input_text.pack(fill=tk.X)
        
        # 检测按钮
        detect_btn = tk.Button(
            parent,
            text="🔍 检测情绪",
            font=('Microsoft YaHei UI', 13, 'bold'),
            bg=color,
            fg="white",
            activebackground=self._darken_color_hex(color, 0.9),
            activeforeground="white",
            relief=tk.FLAT,
            command=self._detect_emotion,
            padx=40,
            pady=14,
            borderwidth=0,
            cursor="hand2"
        )
        detect_btn.pack(fill=tk.X, pady=16)
        
        # 结果卡片
        result_card, result_frame = self._create_card_container(parent)
        
        result_title = tk.Label(
            result_frame,
            text="📊 检测结果",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        result_title.pack(anchor=tk.W, pady=(0, 10))
        
        self.emotion_result = tk.Label(
            result_frame,
            text="等待检测...",
            font=('Microsoft YaHei UI', 10),
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_SECONDARY,
            relief=tk.FLAT,
            borderwidth=0,
            pady=20,
            wraplength=330,
            justify=tk.CENTER
        )
        self.emotion_result.pack(fill=tk.X)
        
        # 建议卡片
        suggestion_card, suggestion_frame = self._create_card_container(parent)
        
        suggestion_title = tk.Label(
            suggestion_frame,
            text="💡 沟通建议",
            font=('Microsoft YaHei UI', 11, 'bold'),
            bg=Colors.BG_CARD,
            fg=Colors.TEXT_PRIMARY
        )
        suggestion_title.pack(anchor=tk.W, pady=(0, 10))
        
        self.suggestion_text = scrolledtext.ScrolledText(
            suggestion_frame,
            height=4,
            font=('Microsoft YaHei UI', 10),
            wrap=tk.WORD,
            bg=Colors.BG_PRIMARY,
            fg=Colors.TEXT_PRIMARY,
            relief=tk.FLAT,
            borderwidth=0,
            state=tk.DISABLED,
            padx=12,
            pady=12,
            highlightthickness=0
        )
        self.suggestion_text.pack(fill=tk.X)
    
    def _back_to_main(self):
        """返回主屏幕"""
        self._create_main_screen()
    
    def _send_message(self):
        """发送消息"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入消息内容")
            return
        
        # 敏感词检测
        is_sensitive, found_words = check_sensitive_words(text)
        if is_sensitive:
            messagebox.showerror(
                "消息包含不当内容",
                f"您的消息包含以下不当词汇：{', '.join(found_words)}\n\n请修改后再发送。"
            )
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
        
        self.chat_history.tag_config("user", foreground=Colors.PRIMARY_DARK, font=('Microsoft YaHei UI', 10, 'bold'))
        self.chat_history.tag_config("assistant", foreground=Colors.PRIMARY, font=('Microsoft YaHei UI', 10, 'bold'))
        self.chat_history.tag_config("info", foreground=Colors.TEXT_SECONDARY)
        self.chat_history.tag_config("suggestion", foreground=Colors.SUCCESS)
        
        self.chat_history.config(state=tk.DISABLED)
        
        # 清空输入框
        self.input_text.delete(1.0, tk.END)
    
    def _rewrite_with_scene(self, scene):
        """按指定场景改写"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入要改写的文字")
            return
        
        # 敏感词检测
        is_sensitive, found_words = check_sensitive_words(text)
        if is_sensitive:
            messagebox.showerror(
                "消息包含不当内容",
                f"您的消息包含以下不当词汇：{', '.join(found_words)}\n\n请修改后再使用改写功能。"
            )
            return
        
        # 更新场景按钮状态
        for widget in self.root.winfo_children():
            self._update_scene_buttons(widget, scene)
        
        # 显示结果
        self.rewrite_result.config(state=tk.NORMAL)
        self.rewrite_result.delete(1.0, tk.END)
        
        self.rewrite_result.insert(tk.END, f"原文：{result['original']}\n\n", "original")
        self.rewrite_result.insert(tk.END, f"改写：{result['rewritten']}\n", "rewritten")
        
        self.rewrite_result.tag_config("original", foreground=Colors.TEXT_SECONDARY)
        self.rewrite_result.tag_config("rewritten", foreground=Colors.SUCCESS, font=('Microsoft YaHei UI', 10, 'bold'))
        
        self.rewrite_result.config(state=tk.DISABLED)
    
    def _rewrite_with_scene_old(self, scene):
        """按指定场景改写（旧版本，保留）"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入要改写的文字")
            return
        
        result = self.rewriter.smart_rewrite(text, scene)
        
        # 更新场景按钮状态
        for widget in self.root.winfo_children():
            self._update_scene_buttons(widget, scene)
        
        # 显示结果
        self.rewrite_result.config(state=tk.NORMAL)
        self.rewrite_result.delete(1.0, tk.END)
        
        self.rewrite_result.insert(tk.END, f"原文：{result['original']}\n\n", "original")
        self.rewrite_result.insert(tk.END, f"改写：{result['rewritten']}\n", "rewritten")
        
        self.rewrite_result.tag_config("original", foreground=Colors.TEXT_SECONDARY)
        self.rewrite_result.tag_config("rewritten", foreground=Colors.SUCCESS, font=('Microsoft YaHei UI', 10, 'bold'))
        
        self.rewrite_result.config(state=tk.DISABLED)
    
    def _update_scene_buttons(self, parent, selected_scene):
        """更新场景按钮状态"""
        for widget in parent.winfo_children():
            if isinstance(widget, tk.Frame):
                self._update_scene_buttons(widget, selected_scene)
            elif isinstance(widget, tk.Button) and widget.cget("text") in self.scenes:
                if widget.cget("text") == selected_scene:
                    # 找到当前屏幕的主色调
                    if self.current_screen == "语气改写":
                        widget.configure(bg=Colors.REWRITE_YELLOW, fg="white")
                    else:
                        widget.configure(bg=Colors.PRIMARY, fg="white")
                else:
                    widget.configure(bg=Colors.BG_PRIMARY, fg=Colors.TEXT_SECONDARY)
    
    def _detect_emotion(self):
        """检测情绪"""
        text = self.input_text.get(1.0, tk.END).strip()
        
        if not text:
            messagebox.showwarning("提示", "请输入要检测的文字")
            return
        
        result = self.detector.detect(text)
        
        # 颜色映射
        color_map = {
            "safe": "#DCFCE7",    # 浅绿色
            "mild": "#FEF3C7",    # 浅黄色
            "moderate": "#FED7AA", # 浅橙色
            "severe": "#FECACA",   # 浅红色
            "violation": "#E9D5FF" # 浅紫色
        }
        
        # 图标和文字映射
        icon_map = {
            "safe": ("✅", "安全", "语气友好，沟通顺畅"),
            "mild": ("⚠️", "轻微风险", "语气略显生硬，建议调整"),
            "moderate": ("⚠️", "中等风险", "语气较为激烈，需要缓和"),
            "severe": ("❌", "高度风险", "语气过于激烈，容易引起误解"),
            "violation": ("🚫", "违规用语", "包含不适宜的表达方式")
        }
        
        icon, level_name, description = icon_map.get(result["level"], ("❓", "未知", ""))
        
        # 更新显示
        self.emotion_result.config(
            text=f"{icon} {level_name}\n\n{description}",
            bg=color_map.get(result["level"], "#FFFFFF"),
            fg=Colors.TEXT_PRIMARY
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