# Excalidraw (Open Source Fork)

这是一个基于 [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) 的二次开发版本，
我在原项目基础上完成了自定义改动，并整理为可直接开源发布的仓库结构。

在线体验地址：https://xkw.deepextractai.com/excalidraw

## 项目说明

- 保留了 Excalidraw Monorepo 结构（`packages/` + `excalidraw-app/` + `examples/`）
- 适合继续做编辑器能力开发、功能定制或私有部署
- 已清理本地依赖和常见系统垃圾文件，可直接初始化 Git 并推送 GitHub

## 目录结构

```text
.
|- excalidraw-app/      # Web 应用入口
|- packages/            # 核心包与组件库
|- examples/            # 集成示例
|- public/              # 静态资源
|- scripts/             # 构建/发布脚本
|- LICENSE              # 开源协议
`- README.md
```

## 本地开发

### 环境要求

- Node.js >= 18
- Yarn 1.x（项目使用 `yarn@1.22.x`）

### 安装依赖

```bash
yarn install
```

### 启动开发环境

```bash
yarn start
```

### 常用命令

```bash
yarn test:typecheck   # TypeScript 类型检查
yarn test:update      # 运行测试（含快照更新）
yarn fix              # 自动修复格式和 lint 问题
yarn build            # 构建应用
```

## 开源协议

本项目采用 **MIT License**，详见 `LICENSE`。

## 致谢

本项目基于 Excalidraw 开源项目进行开发：

- Upstream: https://github.com/excalidraw/excalidraw
- License: MIT

感谢 Excalidraw 团队与社区贡献。

## 关注公众号

欢迎关注我的公众号「阿玮的AI实战与商业思考」：

如果这个项目对你有帮助，欢迎给仓库点个 Star，并关注公众号获取更多实战更新。

![qrcode](./qrcode.jpg)
