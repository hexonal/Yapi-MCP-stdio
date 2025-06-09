#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YapiMcpServer } from "./server.js";
import { getServerConfig } from "./config.js";

async function main(): Promise<void> {
  try {
    // 获取配置
    const config = getServerConfig();

    // 创建服务器实例
    const server = new YapiMcpServer(
      config.yapiBaseUrl,
      config.yapiToken,
      config.yapiLogLevel,
      config.yapiCacheTTL
    );

    // 创建 stdio 传输
    const transport = new StdioServerTransport();

    // 连接服务器
    await server.connect(transport);

    console.error("YApi MCP Server running on stdio");

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to start YApi MCP Server:", error.message);
    } else {
      console.error("Failed to start YApi MCP Server with unknown error:", error);
    }
    process.exit(1);
  }
}

// 优雅关闭处理
process.on("SIGINT", () => {
  console.error("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

main().catch((error: unknown) => {
  console.error("Unhandled error in main:", error);
  process.exit(1);
});
