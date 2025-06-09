# 发布流程文档

本文档详细说明了如何将 YApi MCP Server 发布到 npm 以供 bunx/npx 使用。

## 📋 发布前检查清单

### 1. 环境准备
- [ ] 确保已安装 Node.js >= 18.0.0
- [ ] 确保已安装 pnpm 或 npm
- [ ] 确保已有 npm 账号并登录

### 2. 项目验证
```bash
# 克隆项目
git clone https://github.com/hexonal/Yapi-MCP-stdio.git
cd Yapi-MCP-stdio

# 安装依赖
pnpm install

# 类型检查
pnpm run type-check

# 构建项目
pnpm run build

# 测试本地构建
node dist/cli.js --help
```

### 3. 代码质量检查
```bash
# 代码格式化
pnpm run format

# 代码规范检查
pnpm run lint

# 确保没有 TypeScript 错误
pnpm run type-check
```

## 🚀 发布步骤

### 步骤 1：更新版本号
```bash
# 更新版本号（选择其一）
npm version patch    # 修复版本 (1.0.0 -> 1.0.1)
npm version minor    # 次要版本 (1.0.0 -> 1.1.0)
npm version major    # 主要版本 (1.0.0 -> 2.0.0)
```

### 步骤 2：构建项目
```bash
# 清理并重新构建
pnpm run build

# 验证构建产物
ls -la dist/
```

### 步骤 3：登录 npm
```bash
# 登录 npm（如果没有登录过）
npm login

# 验证登录状态
npm whoami
```

### 步骤 4：发布到 npm
```bash
# 发布到 npm
npm publish

# 如果包名已存在，需要使用 scoped package
npm publish --access public
```

### 步骤 5：验证发布成功
```bash
# 验证包是否可以安装
npx yapi-mcp-server --help

# 或使用 bunx
bunx -y yapi-mcp-server --help
```

## 🔧 常见问题与解决方案

### 问题 1：包名冲突
如果 `yapi-mcp-server` 名称已被占用：

```json
// 修改 package.json 中的 name
{
  "name": "@hexonal/yapi-mcp-server",
  // 或者
  "name": "yapi-mcp-stdio"
}
```

### 问题 2：构建失败
```bash
# 清理所有文件重新开始
rm -rf node_modules dist
pnpm install
pnpm run build
```

### 问题 3：权限问题
```bash
# 如果遇到权限问题
npm login
npm whoami
npm publish --access public
```

### 问题 4：版本管理
```bash
# 查看当前版本
npm version

# 查看 npm 上的版本
npm view yapi-mcp-server versions --json
```

## 📁 发布的文件清单

确保以下文件包含在发布中（参考 package.json 的 `files` 字段）：

```
dist/          # 构建产物
├── cli.js     # 入口文件
├── server.js  # 服务器代码
├── config.js  # 配置模块
└── ...        # 其他编译后的文件

README.md      # 使用文档
LICENSE        # 许可证
```

## 🔄 版本更新流程

### 补丁版本 (Patch)
适用于：错误修复、小改动
```bash
npm version patch
git push && git push --tags
npm publish
```

### 次要版本 (Minor)
适用于：新功能、向后兼容的改动
```bash
npm version minor
git push && git push --tags
npm publish
```

### 主要版本 (Major)
适用于：破坏性改动、不向后兼容
```bash
npm version major
git push && git push --tags
npm publish
```

## 🎯 发布后验证

### 1. 安装测试
```bash
# 全局安装测试
npm install -g yapi-mcp-server
yapi-mcp-server --help

# bunx 测试
bunx -y yapi-mcp-server --help
```

### 2. MCP 配置测试
在 `~/.cursor/mcp.json` 中添加配置：
```json
{
  "mcpServers": {
    "yapi": {
      "command": "bunx",
      "args": ["-y", "yapi-mcp-server"],
      "env": {
        "YAPI_BASE_URL": "https://demo.yapi.com",
        "YAPI_TOKEN": "test:token",
        "YAPI_LOG_LEVEL": "debug"
      }
    }
  }
}
```

### 3. 监控下载量
- 访问 https://www.npmjs.com/package/yapi-mcp-server
- 查看下载统计和版本信息

## 📊 发布状态追踪

- **最新版本**: 在 [npm](https://www.npmjs.com/package/yapi-mcp-server) 查看
- **GitHub Release**: 在 [GitHub](https://github.com/hexonal/Yapi-MCP-stdio/releases) 查看
- **下载统计**: 使用 `npm view yapi-mcp-server` 查看

---

**注意事项**：
- 每次发布前请确保代码已经过充分测试
- 遵循语义化版本控制 (Semantic Versioning)
- 及时更新 CHANGELOG.md 记录变更
- 重要变更请同时在 GitHub 创建 Release 