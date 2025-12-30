#!/bin/bash

# 为 map_militrary-exercise.io 仓库构建（根路径部署）

echo "🔨 为 map_militrary-exercise.io 构建（使用根路径 /）..."
echo ""

# 清理旧的构建
if [ -d "dist" ]; then
    echo "清理旧的构建文件..."
    rm -rf dist
fi

# 使用根路径构建
echo "开始构建（BASE_PATH=/）..."
VITE_BASE_PATH=/ npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建完成！"
    echo ""
    echo "📋 接下来的步骤："
    echo "1. 进入 dist 目录："
    echo "   cd dist"
    echo ""
    echo "2. 检查 dist 是否已经是 git 仓库："
    echo "   git status"
    echo ""
    echo "3. 如果不是，初始化 git 并添加远程仓库："
    echo "   git init"
    echo "   git remote add origin https://github.com/ke22/map_militrary-exercise.io.git"
    echo "   git checkout -b main"
    echo ""
    echo "4. 添加、提交并推送："
    echo "   git add -A"
    echo "   git commit -m \"Update build with fixed BASE_URL\""
    echo "   git push -u origin main"
    echo ""
    echo "或者使用以下命令快速推送（如果已经是 git 仓库）："
    echo "   cd dist && git add -A && git commit -m \"Update build\" && git push"
else
    echo ""
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

