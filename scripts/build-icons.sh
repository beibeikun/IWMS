#!/bin/bash

# IWMS 图标构建脚本
# 将PNG图标转换为不同平台需要的格式

echo "🚀 开始构建IWMS应用图标..."

# 检查assets目录
if [ ! -d "assets" ]; then
    echo "❌ assets目录不存在"
    exit 1
fi

# 检查源图标
if [ ! -f "assets/icon.png" ]; then
    echo "❌ assets/icon.png不存在"
    exit 1
fi

echo "✅ 找到源图标: assets/icon.png"

# 创建build目录
mkdir -p build

# 检查是否安装了ImageMagick
if ! command -v convert &> /dev/null; then
    echo "⚠️  未安装ImageMagick，跳过图标转换"
    echo "   请安装ImageMagick: brew install imagemagick"
    echo "   或者手动准备以下图标文件："
    echo "   - assets/icon.icns (Mac)"
    echo "   - assets/icon.ico (Windows)"
    echo "   - assets/icon.png (Linux，已存在)"
    exit 0
fi

echo "🔄 开始转换图标..."

# 转换为Mac图标 (.icns)
echo "📱 生成Mac图标..."
convert assets/icon.png -resize 512x512 build/icon-512.png
convert assets/icon.png -resize 256x256 build/icon-256.png
convert assets/icon.png -resize 128x128 build/icon-128.png
convert assets/icon.png -resize 64x64 build/icon-64.png
convert assets/icon.png -resize 32x32 build/icon-32.png
convert assets/icon.png -resize 16x16 build/icon-16.png

# 创建.icns文件（需要iconutil命令，macOS自带）
if command -v iconutil &> /dev/null; then
    mkdir -p build/icon.iconset
    cp build/icon-16.png build/icon.iconset/icon_16x16.png
    cp build/icon-32.png build/icon.iconset/icon_16x16@2x.png
    cp build/icon-32.png build/icon.iconset/icon_32x32.png
    cp build/icon-64.png build/icon.iconset/icon_32x32@2x.png
    cp build/icon-128.png build/icon.iconset/icon_128x128.png
    cp build/icon-256.png build/icon.iconset/icon_128x128@2x.png
    cp build/icon-256.png build/icon.iconset/icon_256x256.png
    cp build/icon-512.png build/icon.iconset/icon_256x256@2x.png
    cp build/icon-512.png build/icon.iconset/icon_512x512.png
    cp build/icon-512.png build/icon.iconset/icon_512x512@2x.png
    
    iconutil -c icns build/icon.iconset -o assets/icon.icns
    echo "✅ 生成Mac图标: assets/icon.icns"
    
    # 清理临时文件
    rm -rf build/icon.iconset
else
    echo "⚠️  iconutil命令不可用，跳过.icns生成"
fi

# 转换为Windows图标 (.ico)
echo "🪟 生成Windows图标..."
convert build/icon-16.png build/icon-32.png build/icon-48.png build/icon-64.png build/icon-128.png build/icon-256.png assets/icon.ico
echo "✅ 生成Windows图标: assets/icon.ico"

# 清理临时文件
rm -f build/icon-*.png

echo "🎉 图标构建完成！"
echo ""
echo "📁 生成的文件："
echo "   - assets/icon.icns (Mac应用)"
echo "   - assets/icon.ico (Windows应用)"
echo "   - assets/icon.png (Linux应用，已存在)"
echo ""
echo "🚀 现在可以运行打包命令："
echo "   npm run build:mac-arm    # 打包ARM Mac应用"
echo "   npm run build:win-x64    # 打包x64 Windows应用"
echo "   npm run build:all        # 打包所有平台"
