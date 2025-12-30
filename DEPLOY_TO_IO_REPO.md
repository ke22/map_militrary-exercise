# 📦 部署到 map_militrary-exercise.io 仓库

## ✅ 已完成

- ✅ 代码已成功推送到 `map_militrary-exercise.io` 仓库
- ✅ 文件结构正确：`index.html` 在根目录
- ✅ 使用根路径部署（`base: '/'`）

## ⚠️ 需要配置 GitHub Pages

### 步骤 1：访问仓库设置

打开：**https://github.com/ke22/map_militrary-exercise.io/settings/pages**

### 步骤 2：配置 Pages 设置

1. 在 **Source** 部分：
   - 选择：**Deploy from a branch**
   - **Branch**：选择 `main`
   - **Folder**：选择 `/ (root)` 或 `/`
   - 点击 **Save**（保存）

2. 等待部署：
   - GitHub 需要 **1-5 分钟** 处理
   - 页面上会显示部署状态
   - 完成后会显示绿色的勾勾 ✅

### 步骤 3：验证部署

部署完成后，访问：
**https://ke22.github.io/map_militrary-exercise.io/**

## 🔍 故障排除

如果仍然显示 404：

1. **检查文件是否存在**：
   - 访问：https://github.com/ke22/map_militrary-exercise.io
   - 确认可以看到 `index.html` 文件

2. **检查分支**：
   - 确认使用的是 `main` 分支（不是 `master`）

3. **等待时间**：
   - 首次部署可能需要 **5-10 分钟**
   - 刷新页面查看状态

4. **清除缓存**：
   - 使用无痕模式访问
   - 或清除浏览器缓存

5. **检查 Pages 设置**：
   - 回到 Settings > Pages
   - 查看是否有错误信息
   - 查看部署日志

## 📝 文件结构

当前仓库结构应该是：
```
map_militrary-exercise.io/
├── index.html
├── assets/
│   ├── index-DOMbtEBc.js
│   ├── index-fuUwZWU7.css
│   └── cna_logo-vgi-JXiy.svg
```

## 🔄 更新部署

如果需要更新部署：

```bash
cd /Users/yulincho/Documents/GitHub/map_軍演

# 1. 重新构建
npm run build

# 2. 进入 dist 目录
cd dist

# 3. 提交并推送
git add -A
git commit -m "Update deployment"
git push origin main
```

## 🌐 嵌入到其他网页

部署完成后，可以使用：

```html
<!-- iframe 嵌入 -->
<iframe 
    src="https://ke22.github.io/map_militrary-exercise.io/" 
    width="100%" 
    height="600px" 
    frameborder="0"
    style="border: none;">
</iframe>

<!-- 或直接链接 -->
<a href="https://ke22.github.io/map_militrary-exercise.io/" target="_blank">
    查看軍演地圖
</a>
```

