# ==============================================
# 温言助手 - 主入口文件
# 功能：启动应用程序
# ==============================================

import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def run_cli():
    """运行命令行版本"""
    from data.emotion_words import SWEAR_WORDS, RISKY_WORDS, FRIENDLY_REPLACE, SCENE_SUFFIX
    from core.emotion_detector import EmotionDetector
    from core.text_rewriter import TextRewriter
    
    detector = EmotionDetector()
    rewriter = TextRewriter()
    
    print("=" * 50)
    print("        温言助手 V1.0")
    print("=" * 50)
    print("💬 功能：情绪风险检测 | 职场/朋友/家庭 语气改写")
    print("🚪 输入'退出'可关闭程序\n")
    
    scenes = ["职场", "朋友", "家庭"]
    
    while True:
        try:
            user_input = input("请输入要检测的文字：").strip()
            
            if user_input.lower() in ["退出", "exit", "quit"]:
                print("\n再见～温言助手随时为你服务！")
                break
            
            if not user_input:
                print("请输入内容！\n")
                continue
            
            # 检测情绪
            result = detector.detect(user_input)
            print(f"\n情绪检测结果：")
            
            if result["level"] == "violation":
                swear_words = ", ".join(result["swear_found"])
                print(f"  🚫 违规用语：{swear_words}")
                print(f"  ⚠️  {result['description']}")
            elif result["emotion_types"]:
                types = ", ".join(result["emotion_types"])
                print(f"  ⚠️  检测到{types}情绪")
                print(f"  ⚠️  {result['description']}")
            else:
                print(f"  ✅ {result['description']}")
            
            # 选择场景
            print("\n请选择改写场景：")
            for i, scene in enumerate(scenes, 1):
                print(f"  {i}. {scene}")
            
            scene_choice = input("\n请输入选项 (1-3，默认 1): ").strip() or "1"
            
            try:
                scene_idx = int(scene_choice) - 1
                if 0 <= scene_idx < len(scenes):
                    scene = scenes[scene_idx]
                else:
                    scene = "职场"
            except ValueError:
                scene = "职场"
            
            # 改写
            rewrite_result = rewriter.rewrite(user_input, scene)
            print(f"\n【{scene}改写结果】")
            print(f"  原文：{rewrite_result['original']}")
            print(f"  改写：{rewrite_result['rewritten']}")
            
            if rewrite_result["changed"]:
                print(f"\n  🔄 改写步骤：")
                for step in rewrite_result["steps"]:
                    print(f"    {step['step']}:")
                    for rep in step["replacements"]:
                        print(f"      '{rep['original']}' → '{rep['replaced']}'")
            
            print("\n" + "-" * 50 + "\n")
            
        except KeyboardInterrupt:
            print("\n\n再见～温言助手随时为你服务！")
            break
        except Exception as e:
            print(f"\n发生错误：{e}\n")


def run_gui():
    """运行 GUI 版本"""
    try:
        import tkinter as tk
        from ui.gui_app import WenyanApp
        
        root = tk.Tk()
        app = WenyanApp(root)
        root.mainloop()
    except ImportError as e:
        print(f"GUI 模块导入失败：{e}")
        print("将切换到命令行模式...")
        run_cli()


def main():
    """主函数"""
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        if mode in ["-g", "--gui"]:
            run_gui()
        elif mode in ["-c", "--cli"]:
            run_cli()
        else:
            print("用法：python main.py [-g|--gui|-c|--cli]")
            print("  -g, --gui  运行 GUI 版本")
            print("  -c, --cli  运行命令行版本")
            print("  不传参数默认运行 GUI 版本")
            run_gui()
    else:
        # 默认运行 GUI 版本
        run_gui()


if __name__ == "__main__":
    main()