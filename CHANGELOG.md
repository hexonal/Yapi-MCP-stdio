# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🐛 Fixed
- **日志格式优化**：将日志输出从简单字符串格式改为结构化的 JSON 格式
  - 包含标准字段：`timestamp`（ISO 8601格式）、`level`、`service`、`message`、`data`
  - 优化 Error 对象序列化，正确提取 `name`、`message` 和 `stack` 信息
  - 支持复杂对象和数组的日志记录
  - 便于日志收集系统（如 ELK、Fluentd）进行结构化解析和分析

## [1.0.0] - 2024-01-XX

### 🎉 Initial Release

#### ✨ Added
- **MCP 服务器核心功能**：完全重构为 stdio 模式的 MCP 服务器
- **环境变量配置**：支持通过环境变量和 CLI 参数进行配置
- **bunx/npx 支持**：优化为支持 `bunx -y yapi-mcp-server` 直接使用

#### 🗑️ Removed
- **废除 .env 文件**：移除对 .env 配置文件的支持
- **废弃 SSE 模式**：移除 Server-Sent Events 和 Express 服务器相关代码
- **简化架构**：移除 HTTP 服务器，只保留 stdio 传输模式

#### 🔧 Changed
- **配置方式**：从文件配置改为环境变量 + CLI 参数配置
- **包名优化**：调整为更清晰的包名和依赖结构
- **构建优化**：改进 TypeScript 构建配置和输出

#### 🛠️ Technical Details
- **运行时要求**：Node.js >= 18.0.0
- **主要依赖**：
  - `@modelcontextprotocol/sdk`: ^1.6.0
  - `axios`: ^1.7.9  
  - `yargs`: ^17.7.2
  - `zod`: ^3.24.2

#### 🌟 Features
- **YApi 接口管理**：
  - `yapi_get_api_desc` - 获取 YApi 接口详细信息
  - `yapi_save_api` - 新增或更新 YApi 接口
  - `yapi_search_apis` - 搜索 YApi 接口
  - `yapi_list_projects` - 列出 YApi 项目
  - `yapi_get_categories` - 获取接口分类列表

#### 📚 Documentation
- **README.md**：完整的安装和使用指南
- **PUBLISHING.md**：详细的发布流程文档
- **支持的配置**：
  - `YAPI_BASE_URL` - YApi 服务器基础 URL
  - `YAPI_TOKEN` - YApi 项目令牌（支持多项目）
  - `YAPI_CACHE_TTL` - 缓存时效（分钟）
  - `YAPI_LOG_LEVEL` - 日志级别

### 📋 Migration Guide

如果你正在从之前的版本迁移：

1. **移除 .env 文件**：不再需要 .env 配置文件
2. **更新 MCP 配置**：在 `~/.cursor/mcp.json` 中使用新的配置格式：
   ```json
   {
     "mcpServers": {
       "yapi": {
         "command": "bunx",
         "args": ["-y", "yapi-mcp-server"],
         "env": {
           "YAPI_BASE_URL": "https://your-yapi-domain.com",
           "YAPI_TOKEN": "projectId:token",
           "YAPI_CACHE_TTL": "10",
           "YAPI_LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

---

## [Unreleased]

### 🔮 Planned Features
- [ ] 支持更多 YApi 接口操作
- [ ] 增强错误处理和用户体验
- [ ] 添加单元测试
- [ ] 性能优化和缓存改进

---

**Legend:**
- 🎉 Major release
- ✨ Added
- 🔧 Changed  
- 🗑️ Removed
- 🐛 Fixed
- 🛠️ Technical
- 📚 Documentation
- 🔮 Planned 