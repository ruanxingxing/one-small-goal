# 一个小目标

一个专注于个人待办事项的本地 Web 应用。每个事项包含明确目标、截止时间、完成记录和遇到的问题。

## 功能

- 新增带目标与截止时间的事项
- 标记完成并记录完成情况
- 记录执行过程中遇到的问题
- 修改完成记录
- 重新打开已完成事项
- 删除事项并二次确认
- 全部、进行中、已逾期、已完成筛选
- 按事项、目标、完成情况和问题搜索
- 展示完成率、待办数、今日截止数和逾期数
- 数据自动保存在浏览器 `localStorage`
- 响应式布局与键盘可访问性

## 启动

需要 Node.js 20.19+ 或 22.12+。

```powershell
npm install
npm run dev
```

终端会显示本地访问地址，通常为 `http://127.0.0.1:5173`。

## 验证

```powershell
npm run check
npm run build
```

`npm run check` 会执行 TypeScript 类型检查和 Vitest 测试，`npm run build` 会生成生产构建到 `dist/`。

## GitHub Pages

项目包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 分支后，GitHub Actions 会自动：

1. 安装锁定版本的依赖；
2. 执行类型检查和测试；
3. 构建生产版本；
4. 发布到 GitHub Pages。

首次发布前，需要在仓库的 **Settings > Pages** 中将发布来源设为 **GitHub Actions**。

## 项目结构

```text
src/
├── components/       界面组件
├── lib/              日期和待办业务逻辑
├── test/             测试配置
├── App.tsx           应用主界面和状态
├── types.ts          数据模型
└── styles.css        视觉样式
AGENTS.md             Agent 长期规则
docs/agent-team/      Agent 角色与协作规则
```

## 数据说明

数据存储在当前浏览器的 `one-small-goal:v1` 键中，不会上传到服务器。清除浏览器站点数据会同时删除事项；当前版本也不支持跨设备同步。

## 下一阶段

可以继续加入：

- 事项编辑与优先级
- 重复任务和提醒
- 按周或按月统计
- JSON 导入导出与备份
- 用户账号和跨设备同步
