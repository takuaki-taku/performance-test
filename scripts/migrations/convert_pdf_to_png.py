"""
PDFをPNGに変換するスクリプト

PDFファイルを1ページずつPNG画像に変換し、frontend/public/images/に保存します。

使用方法:
    python scripts/migrations/convert_pdf_to_png.py

必要なライブラリ:
    pip install pdf2image pillow

必要なシステム依存:
    - Poppler (PDFレンダリングエンジン)
    macOS: brew install poppler
    Ubuntu: sudo apt-get install poppler-utils
    Windows: https://github.com/oschwartz10612/poppler-windows/releases
"""
import os
import sys
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


def convert_pdf_to_png(pdf_path: Path, output_dir: Path, category: str, series_name: str, series_number: int = 1):
    """
    PDFをPNGに変換して保存
    
    Args:
        pdf_path: PDFファイルのパス
        output_dir: 出力ディレクトリ（例: frontend/public/images/warmup/）
        category: カテゴリ名（"warmup" または "cooldown"）
        series_name: シリーズ名（例: "ウォームアップ", "クールダウン"）
        series_number: シリーズ番号（デフォルト: 1）
    """
    if not pdf_path.exists():
        print(f"❌ PDFファイルが見つかりません: {pdf_path}")
        return []
    
    print(f"📄 PDFを読み込み中: {pdf_path.name}")
    
    try:
        # PDFを画像に変換
        images = convert_from_path(str(pdf_path), dpi=300)
        print(f"✅ {len(images)}ページを変換しました")
    except Exception as e:
        print(f"❌ PDF変換エラー: {e}")
        print("   Popplerがインストールされているか確認してください")
        return []
    
    # 出力ディレクトリを作成
    output_dir.mkdir(parents=True, exist_ok=True)
    
    saved_files = []
    
    for page_num, image in enumerate(images, start=1):
        # ファイル名: {series_name}_series{series_number}_page{page_number}.png
        # 例: クールダウン_series1_page1.png
        filename = f"{series_name}_series{series_number}_page{page_num:03d}.png"
        output_path = output_dir / filename
        
        # PNGとして保存
        image.save(output_path, "PNG", quality=95)
        saved_files.append(output_path)
        print(f"  ✅ 保存: {filename}")
    
    return saved_files


def main():
    """メイン処理"""
    project_root = Path(__file__).parent.parent.parent
    
    # PDFファイルのパス
    pdf_files = [
        {
            "path": project_root / "Stretching for cool down.pdf",
            "category": "cooldown",
            "series_name": "クールダウン",
            "series_number": 1,
        },
        {
            "path": project_root / "202010Lynx warm up写真付きver1.pdf",
            "category": "warmup",
            "series_name": "ウォームアップ",
            "series_number": 1,
        },
    ]
    
    # 出力ディレクトリ
    images_dir = project_root / "frontend" / "public" / "images"
    
    all_saved_files = []
    
    for pdf_info in pdf_files:
        pdf_path = pdf_info["path"]
        category = pdf_info["category"]
        series_name = pdf_info["series_name"]
        series_number = pdf_info["series_number"]
        
        if not pdf_path.exists():
            print(f"⚠️  スキップ: {pdf_path.name} (ファイルが見つかりません)")
            continue
        
        output_dir = images_dir / category
        print(f"\n{'='*60}")
        print(f"処理中: {pdf_path.name}")
        print(f"カテゴリ: {category}")
        print(f"シリーズ: {series_name} シリーズ{series_number}")
        print(f"{'='*60}")
        
        saved_files = convert_pdf_to_png(
            pdf_path=pdf_path,
            output_dir=output_dir,
            category=category,
            series_name=series_name,
            series_number=series_number,
        )
        
        all_saved_files.extend(saved_files)
    
    print(f"\n{'='*60}")
    print(f"✅ 変換完了！")
    print(f"   合計 {len(all_saved_files)} ファイルを保存しました")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()

