import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { Logger, getLogLevel } from "./services/yapi/logger";

/**
 * 服务器配置接口
 */
interface ServerConfig {
  yapiBaseUrl: string;
  yapiToken: string;
  yapiCacheTTL: number; // 缓存时效，单位为分钟
  yapiLogLevel: string; // 日志级别：debug, info, warn, error, none
}

/**
 * CLI 参数接口
 */
interface CliArgs {
  "yapi-base-url"?: string;
  "yapi-token"?: string;
  "yapi-cache-ttl"?: number;
  "yapi-log-level"?: string;
  stdio?: boolean;
}

/**
 * 脱敏 API Key
 */
function maskApiKey(key: string): string {
  if (key.length <= 8) return "*".repeat(key.length);
  return key.substring(0, 4) + "*".repeat(key.length - 8) + key.substring(key.length - 4);
}

/**
 * 获取服务器配置
 * 优先级：CLI 参数 > 环境变量 > 默认值
 */
export function getServerConfig(): ServerConfig {
  // 解析 CLI 参数
  const argv = yargs(hideBin(process.argv))
    .option("yapi-base-url", {
      type: "string",
      description: "YApi base URL",
    })
    .option("yapi-token", {
      type: "string",
      description: "YApi token (format: projectId:token,projectId2:token2)",
    })
    .option("yapi-cache-ttl", {
      type: "number",
      description: "Cache TTL in minutes",
      default: 10,
    })
    .option("yapi-log-level", {
      type: "string",
      description: "Log level (debug, info, warn, error, none)",
      default: "info",
    })
    .option("stdio", {
      type: "boolean",
      description: "Use stdio transport",
      default: true,
    })
    .parseSync() as CliArgs;

  // 获取配置值（CLI 参数优先，然后是环境变量）
  const yapiBaseUrl = argv["yapi-base-url"] || process.env.YAPI_BASE_URL;
  const yapiToken = argv["yapi-token"] || process.env.YAPI_TOKEN;
  const yapiCacheTTL = argv["yapi-cache-ttl"] || Number(process.env.YAPI_CACHE_TTL) || 10;
  const yapiLogLevel = argv["yapi-log-level"] || process.env.YAPI_LOG_LEVEL || "info";

  // 验证必需配置
  if (!yapiBaseUrl) {
    throw new Error("YApi base URL is required. Set YAPI_BASE_URL environment variable or use --yapi-base-url");
  }

  if (!yapiToken) {
    throw new Error("YApi token is required. Set YAPI_TOKEN environment variable or use --yapi-token");
  }

  const config: ServerConfig = {
    yapiBaseUrl,
    yapiToken,
    yapiCacheTTL,
    yapiLogLevel,
  };

  // 创建临时 logger 用于输出配置信息
  const logger = new Logger("CONFIG", getLogLevel(yapiLogLevel));

  logger.info("Server configuration:");
  logger.info(`- YApi Base URL: ${yapiBaseUrl}`);
  logger.info(`- YApi Token: ${maskApiKey(yapiToken)}`);
  logger.info(`- Cache TTL: ${yapiCacheTTL} minutes`);
  logger.info(`- Log Level: ${yapiLogLevel}`);

  return config;
}

/**
 * 获取配置来源描述
 */
export function getConfigSources(): Record<string, string> {
  const argv = yargs(hideBin(process.argv)).parseSync() as CliArgs;

  return {
    yapiBaseUrl: argv["yapi-base-url"] ? "CLI" : (process.env.YAPI_BASE_URL ? "ENV" : "DEFAULT"),
    yapiToken: argv["yapi-token"] ? "CLI" : (process.env.YAPI_TOKEN ? "ENV" : "DEFAULT"),
    yapiCacheTTL: argv["yapi-cache-ttl"] ? "CLI" : (process.env.YAPI_CACHE_TTL ? "ENV" : "DEFAULT"),
    yapiLogLevel: argv["yapi-log-level"] ? "CLI" : (process.env.YAPI_LOG_LEVEL ? "ENV" : "DEFAULT"),
  };
}
