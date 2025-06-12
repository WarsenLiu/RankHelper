# RankHelper 下载页面

这是 RankHelper 软件的官方下载页面，使用 Vue 3 + Vite 构建。

## 功能特点

- 响应式设计，适配各种设备
- 并行下载分片安装包
- 实时下载进度显示
- 软件演示区域（待添加）

## 开发说明

### 环境要求

- Node.js 16+
- npm 7+

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署说明

1. 运行 `npm run build` 生成生产版本
2. 将生成的 `dist` 目录内容部署到 Cloudflare Pages
3. 确保所有分片安装包文件（.zip.001 - .zip.009）和 favicon.ico 都放在正确的位置

## 注意事项

- 安装包分片文件需要放在项目根目录下
- 确保所有静态资源（图片、分片文件等）都已正确放置
- 部署前请测试下载功能是否正常工作
