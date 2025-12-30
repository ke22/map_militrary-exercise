#!/bin/bash

# 打開鄰接區計算工具
# 使用方式：./scripts/open-calculator.sh

cd "$(dirname "$0")/.."

# 從 .env 讀取 token（如果存在）
if [ -f .env ]; then
    TOKEN=$(grep "^VITE_MAPBOX_TOKEN=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ ! -z "$TOKEN" ]; then
        echo "找到 Mapbox Token，將在工具中自動填入"
        open "scripts/export-contiguous-zone.html?token=$TOKEN"
    else
        echo "未找到 VITE_MAPBOX_TOKEN，將打開工具讓您手動輸入"
        open "scripts/export-contiguous-zone.html"
    fi
else
    echo "未找到 .env 文件，將打開工具讓您手動輸入 Token"
    open "scripts/export-contiguous-zone.html"
fi

echo ""
echo "工具已打開！"
echo "如果沒有自動填入 Token，請手動輸入"
echo "然後點擊「初始化地圖」→「計算並導出鄰接區」"

