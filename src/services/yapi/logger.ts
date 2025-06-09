/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * 日志级别字符串映射
 */
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  'debug': LogLevel.DEBUG,
  'info': LogLevel.INFO,
  'warn': LogLevel.WARN,
  'error': LogLevel.ERROR,
  'none': LogLevel.NONE
};

/**
 * 日志级别名称映射
 */
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE'
};

/**
 * 获取日志级别
 */
export function getLogLevel(level: string): LogLevel {
  return LOG_LEVEL_MAP[level.toLowerCase()] ?? LogLevel.INFO;
}

/**
 * 日志记录接口
 */
interface LogRecord {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  data?: any;
}

/**
 * 日志工具类
 */
export class Logger {
  private readonly prefix: string;
  private readonly logLevel: LogLevel;

  constructor(prefix: string, logLevel: LogLevel | string = LogLevel.INFO) {
    this.prefix = prefix;
    this.logLevel = typeof logLevel === 'string' ? getLogLevel(logLevel) : logLevel;
  }

  /**
   * 创建日志记录
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   * @returns 日志记录对象
   */
  private createLogRecord(level: LogLevel, message: string, data?: any): LogRecord {
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level: LOG_LEVEL_NAMES[level],
      service: this.prefix,
      message
    };

    if (data !== undefined && data !== null) {
      // 如果有附加数据，将其序列化
      try {
        if (data instanceof Error) {
          // 特殊处理 Error 对象
          record.data = {
            name: data.name,
            message: data.message,
            stack: data.stack
          };
        } else if (typeof data === 'object') {
          // 检查对象中是否有 Error 类型的属性
          const processedData: any = {};
          for (const [key, value] of Object.entries(data)) {
            if (value instanceof Error) {
              processedData[key] = {
                name: value.name,
                message: value.message,
                stack: value.stack
              };
            } else {
              processedData[key] = value;
            }
          }
          record.data = processedData;
        } else {
          record.data = { args: data };
        }
      } catch (e) {
        record.data = { serialization_error: String(data) };
      }
    }

    return record;
  }

  /**
   * 输出日志到控制台
   * @param level 日志级别
   * @param message 日志消息
   * @param args 额外参数
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (this.logLevel <= level) {
      const data = args.length > 0 ? (args.length === 1 ? args[0] : args) : undefined;
      const record = this.createLogRecord(level, message, data);

      const jsonOutput = JSON.stringify(record);

      // 所有日志都输出到 stderr，避免与 MCP 协议的 stdout 通信冲突
      process.stderr.write(jsonOutput + '\n');
    }
  }

  /**
   * 输出调试日志
   * @param message 日志消息
   * @param args 额外参数
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * 输出信息日志
   * @param message 日志消息
   * @param args 额外参数
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * 输出警告日志
   * @param message 日志消息
   * @param args 额外参数
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * 输出错误日志
   * @param message 日志消息
   * @param args 额外参数
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }
} 