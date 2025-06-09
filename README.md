# YApi MCP Server

一个用于连接 YApi 接口管理平台的 Model Context Protocol (MCP) 服务器。

## 安装

### 方式一：通过 bunx 使用（推荐）
无需安装，直接使用最新版本：
```bash
bunx -y hexonal-yapi-mcp
```

### 方式二：全局安装
```bash
npm install -g hexonal-yapi-mcp
hexonal-yapi-mcp
```

## 配置

### 在 Cursor 中使用

在 `~/.cursor/mcp.json` 中添加配置：

```json
{
  "mcpServers": {
    "yapi": {
      "command": "bunx",
      "args": [
        "-y",
        "hexonal-yapi-mcp"
      ],
      "env": {
        "YAPI_BASE_URL": "https://yapi.your-domain.com",
        "YAPI_TOKEN": "projectId:your_token_here,projectId2:your_token2_here",
        "YAPI_CACHE_TTL": "10",
        "YAPI_LOG_LEVEL": "info"
      }
    }
  }
}
```

### 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `YAPI_BASE_URL` | YApi 服务器基础 URL | ✅ | - |
| `YAPI_TOKEN` | YApi 项目 Token，支持多项目格式：`projectId:token,projectId2:token2` | ✅ | - |
| `YAPI_CACHE_TTL` | 缓存时效（分钟） | ❌ | 10 |
| `YAPI_LOG_LEVEL` | 日志级别：debug, info, warn, error, none | ❌ | info |

### 日志格式

YApi MCP 服务器输出结构化的 JSON 格式日志，便于日志收集和分析系统处理：

```json
{
  "timestamp": "2025-06-09T15:35:35.941Z",
  "level": "INFO",
  "service": "YAPI-MCP",
  "message": "服务器启动",
  "data": {
    "version": "1.0.0",
    "port": 3000,
    "tools": ["yapi_save_api", "yapi_search_apis"]
  }
}
```

字段说明：
- `timestamp`: ISO 8601 格式的时间戳
- `level`: 日志级别（DEBUG、INFO、WARN、ERROR）
- `service`: 服务标识
- `message`: 日志消息
- `data`: 可选的附加数据（对象、数组或基本类型）

### CLI 参数

也可以通过命令行参数覆盖环境变量：

```bash
bunx -y hexonal-yapi-mcp \
  --yapi-base-url=https://yapi.your-domain.com \
  --yapi-token=projectId:your_token_here \
  --yapi-cache-ttl=10 \
  --yapi-log-level=info
```

## 获取 Token

1. 登录你的 YApi 平台
2. 进入项目设置页面
3. 在项目配置中找到 "token配置" 部分
4. 复制显示的 token

![Token配置示例](./images/token.png)

Token 格式示例：
```
1026:c1abxxxxxxxxxx
```

多项目 Token 格式：
```
1026:c1abxxxxxxxxxx,1027:d2bcxxxxxxxxxx
```

## 可用工具

### yapi_get_api_desc
获取 YApi 中特定接口的详细信息

### yapi_save_api
新增或更新 YApi 中的接口信息

### yapi_search_apis
搜索 YApi 中的接口

### yapi_list_projects
列出 YApi 的项目ID和项目名称

### yapi_get_categories
获取 YApi 项目下的接口分类列表

## 开发

```bash
# 克隆代码
git clone https://github.com/hexonal/Yapi-MCP-stdio.git
cd Yapi-MCP-stdio

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建
npm run build

# 本地测试
npm run test:local
```

## 许可证

MIT
