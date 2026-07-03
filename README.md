# OpenSkill Galaxy Module Template

可复用的静态学习模块模板。所有具体模块（如 `module-digital-logic`、`module-python-basic`）都从此模板复制并替换数据。

访问地址：<https://openskill-galaxy.github.io/module-template/>

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- Zustand（状态管理）
- Fuse.js（全文搜索）
- localStorage（进度持久化）
- 静态 JSON 数据（无后端、无数据库、无 AI API）
- GitHub Actions 自动部署到 GitHub Pages

## 功能清单

| 功能 | 路由 | 说明 |
|------|------|------|
| 模块首页 | `/` | 概览、进度、快速入口 |
| 课程列表 | `/courses` | 标签筛选、关键词过滤 |
| 课程详情 | `/courses/:slug` | 讲义列表、进度标记 |
| 章节讲义 | `/lessons/:slug` | Markdown 渲染、上下讲义导航 |
| 知识点库 | `/knowledge` | 标签+难度筛选、术语表 |
| 知识点详情 | `/knowledge/:slug` | 关联题目/案例/术语 |
| 题库练习 | `/questions` | 标签+难度筛选 |
| 题目详情 | `/questions/:slug` | 即时判分、解析 |
| 模拟考试 | `/exams` | 倒计时、答题卡、交卷 |
| 考试结果 | `/exams/:slug/result` | 分数、详情、重考 |
| 错题本 | `/wrong` | 自动收集、重做、清空 |
| 收藏夹 | `/favorites` | 讲义/知识点/题目/案例收藏 |
| 案例训练 | `/cases` | 背景、任务、参考思路 |
| 搜索 | `/search` | Fuse.js 全文检索 |
| 学习路线 | `/routes` | 推荐学习顺序 |
| FAQ | `/faq` | 分类常见问题 |
| 关于本模块 | `/about` | 元数据、统计、清空数据 |

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 本地预览构建产物
```

## 基于模板创建新模块

1. 复制 `02-module-template` 目录
2. 修改 `public/data/module.json` 的 `slug`、`title` 等
3. 替换各 JSON 数据文件为真实内容
4. 修改 `vite.config.ts` 的 `base` 为 `/{new-slug}/`
5. 修改 `package.json` 的 `name`
6. `npm install && npm run build` 验证构建

## 部署

推送到 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

仓库：<https://github.com/openskill-galaxy/module-template>

Pages Source 需在仓库 Settings → Pages → Build and deployment → Source 中选择 **GitHub Actions**。

## 许可

MIT License
