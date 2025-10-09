# Electron 打包说明

## 开发模式

在开发模式下同时运行 Next.js 和 Electron：

\`\`\`bash
npm run electron:dev
\`\`\`

## 构建应用

### 构建所有平台
\`\`\`bash
npm run electron:build
\`\`\`

### 构建特定平台
\`\`\`bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
\`\`\`

## 主题系统

应用支持三种主题模式：

1. **浅色模式** - 明亮的界面
2. **深色模式** - 深色的界面
3. **跟随系统** - 自动跟随操作系统主题设置

### 主题切换方式

- **手动切换**：点击右上角的主题切换按钮
- **自动检测**：选择"跟随系统"后，应用会自动响应系统主题变化

### Electron 集成

在 Electron 环境中，主题系统会：
- 自动读取系统主题偏好
- 监听系统主题变化并实时更新
- 同步 Electron 原生主题和 Web 主题

## 文件结构

\`\`\`
electron/
  ├── main.js       # Electron 主进程
  └── preload.js    # 预加载脚本（IPC 通信）
out/                # Next.js 静态导出目录
dist/               # Electron 打包输出目录
\`\`\`

## 注意事项

1. 应用使用 Next.js 静态导出模式（`output: 'export'`）
2. 所有图片已设置为 `unoptimized: true`
3. Electron 主进程通过 IPC 与渲染进程通信
4. 主题状态通过 `next-themes` 管理，并与 Electron 原生主题同步
\`\`\`
