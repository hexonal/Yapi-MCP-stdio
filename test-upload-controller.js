#!/usr/bin/env node

const { spawn } = require('child_process');

// 设置环境变量 - 修正token格式
process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '9:4997d6402322b0b0363412faa07abadbbb5ac71a9f5ed2055364226a62769a99';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🚀 测试上传 TaskDispositionController 接口到YApi...');
console.log('📊 配置信息:');
console.log(`   - Base URL: ${process.env.YAPI_BASE_URL}`);
console.log(`   - Project ID: 9`);
console.log(`   - Log Level: ${process.env.YAPI_LOG_LEVEL}`);
console.log('');

// 基于TaskDispositionController.java定义的接口
const taskControllerApis = [
    {
        name: '创建任务列表分类',
        tool: 'yapi_save_api',
        params: {
            projectId: '9',
            catid: '1',
            title: '任务调度控制器',
            path: '/task',
            method: 'GET',
            status: 'done',
            desc: '任务调度控制器相关接口分组',
            res_body_type: 'json',
            res_body: JSON.stringify({
                code: 200,
                message: 'success',
                data: 'Task Disposition Controller APIs'
            }),
            markdown: '# 任务调度控制器\n\n支持"做任务领积分"完整业务流程的REST API接口'
        }
    },
    {
        name: '获取任务列表接口',
        tool: 'yapi_save_api',
        params: {
            projectId: '9',
            catid: '1',
            title: '获取任务列表（支持分页和筛选）',
            path: '/task/list',
            method: 'POST',
            status: 'done',
            desc: '合并原有的getUserTaskList和getMoreTasks功能，支持分页查询和任务筛选',
            req_body_type: 'json',
            req_body_other: JSON.stringify({
                pageNum: 1,
                pageSize: 10,
                taskType: 'string',
                status: 'string',
                userId: 'string'
            }),
            res_body_type: 'json',
            res_body: JSON.stringify({
                code: 200,
                message: 'success',
                data: {
                    current: 1,
                    size: 10,
                    total: 100,
                    records: [
                        {
                            taskId: 'number',
                            taskName: 'string',
                            taskDesc: 'string',
                            taskType: 'string',
                            status: 'string',
                            points: 'number',
                            completedCount: 'number',
                            dailyLimit: 'number'
                        }
                    ]
                }
            }),
            markdown: `# 获取任务列表

## 接口说明
获取任务列表，支持分页查询和多条件筛选。合并了原有的getUserTaskList和getMoreTasks功能。

## 请求参数
- pageNum: 页码（默认1）
- pageSize: 每页大小（默认10）
- taskType: 任务类型（可选）
- status: 任务状态（可选）
- userId: 用户ID（可选，用于获取用户特定任务）

## 响应说明
返回分页数据，包含任务列表和分页信息。

## 业务规则
- 支持按任务类型筛选
- 支持按完成状态筛选
- 返回用户可见的任务列表`
        }
    },
    {
        name: '获取任务详情接口',
        tool: 'yapi_save_api',
        params: {
            projectId: '9',
            catid: '1',
            title: '获取任务详情',
            path: '/task/detail/{taskId}',
            method: 'GET',
            status: 'done',
            desc: '根据任务ID获取任务的详细信息，可选择获取用户特定的完成情况',
            req_query: JSON.stringify([
                { name: 'userId', desc: '用户ID', required: '0' }
            ]),
            res_body_type: 'json',
            res_body: JSON.stringify({
                code: 200,
                message: 'success',
                data: {
                    taskId: 'number',
                    taskName: 'string',
                    taskDesc: 'string',
                    taskType: 'string',
                    status: 'string',
                    points: 'number',
                    dailyLimit: 'number',
                    completedCount: 'number',
                    userCompletedToday: 'number',
                    canComplete: 'boolean',
                    nextResetTime: 'string'
                }
            }),
            markdown: `# 获取任务详情

## 接口说明
根据任务ID获取任务的详细信息。如果传入userId，还会返回用户特定的完成情况。

## 路径参数
- taskId: 任务ID（必填）

## 查询参数
- userId: 用户ID（可选，用于获取用户特定的完成情况）

## 响应说明
返回任务的完整信息，包括：
- 基本信息：名称、描述、类型、状态
- 奖励信息：积分数量
- 限制信息：每日限制次数
- 用户信息：用户今日完成次数、是否可完成

## 错误处理
- 任务不存在时返回error信息`
        }
    },
    {
        name: '完成任务接口',
        tool: 'yapi_save_api',
        params: {
            projectId: '9',
            catid: '1',
            title: '完成任务',
            path: '/task/complete',
            method: 'POST',
            status: 'done',
            desc: '用户完成指定任务，包含完整的业务逻辑和状态检查',
            req_body_type: 'form',
            req_body_form: JSON.stringify([
                { name: 'userId', desc: '用户ID', required: '1' },
                { name: 'taskId', desc: '任务ID', required: '1' }
            ]),
            res_body_type: 'json',
            res_body: JSON.stringify({
                code: 200,
                message: '任务完成成功',
                data: true
            }),
            markdown: `# 完成任务

## 接口说明
用户完成指定的任务，系统会进行完整的业务逻辑校验和处理。

## 请求参数
- userId: 用户ID（必填）
- taskId: 任务ID（必填）

## 业务逻辑
1. 验证任务是否存在
2. 检查任务是否已关闭
3. 检查任务是否已过期
4. 检查用户今日完成次数是否达到上限
5. 检查任务是否已经完成过
6. 执行任务完成逻辑
7. 保存完成记录

## 错误码说明
- "任务不存在": 指定的任务ID不存在
- "任务已关闭": 任务当前状态为禁用
- "任务已过期": 任务已超过有效期
- "今日完成次数已达上限": 用户今日完成次数已达到任务设定的每日上限
- "任务已完成": 任务已经完成过（对于一次性任务）
- "任务执行失败": 任务执行过程中出现错误
- "保存失败，请稍后重试": 数据保存失败
- "操作过于频繁，请稍后重试": 并发操作检测到冲突
- "系统异常，请稍后重试": 系统内部错误

## 成功响应
返回boolean类型的true表示任务完成成功`
        }
    },
    {
        name: '领取奖励接口',
        tool: 'yapi_save_api',
        params: {
            projectId: '9',
            catid: '1',
            title: '领取奖励',
            path: '/task/claim',
            method: 'POST',
            status: 'done',
            desc: '用户领取已完成任务的奖励（积分等）',
            req_body_type: 'form',
            req_body_form: JSON.stringify([
                { name: 'userId', desc: '用户ID', required: '1' },
                { name: 'taskId', desc: '任务ID', required: '1' }
            ]),
            res_body_type: 'json',
            res_body: JSON.stringify({
                code: 200,
                message: '奖励领取成功',
                data: true
            }),
            markdown: `# 领取奖励

## 接口说明
用户领取已完成任务的奖励，通常是积分奖励。

## 请求参数
- userId: 用户ID（必填）
- taskId: 任务ID（必填）

## 业务逻辑
1. 验证任务是否存在
2. 验证任务是否已完成
3. 验证奖励是否已经领取过
4. 发放奖励（积分等）
5. 更新领取状态

## 响应说明
- 成功：返回true，表示奖励领取成功
- 失败：返回错误信息说明失败原因

## 注意事项
- 只有已完成的任务才能领取奖励
- 每个任务的奖励只能领取一次
- 系统会自动发放积分到用户账户`
        }
    }
];

async function runApiUploadTest(test) {
    console.log(`\n📋 测试: ${test.name}`);
    console.log(`🔧 工具: ${test.tool}`);

    return new Promise((resolve, reject) => {
        const child = spawn('node', ['./dist/cli.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env
        });

        let responseData = '';
        let errorData = '';

        // 构造MCP请求
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: test.tool,
                arguments: test.params
            }
        };

        console.log(`📝 上传接口: ${test.params.title}`);

        // 发送请求
        child.stdin.write(JSON.stringify(request) + '\n');
        child.stdin.end();

        // 收集响应
        child.stdout.on('data', (data) => {
            responseData += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        child.on('close', (code) => {
            console.log(`💻 退出码: ${code}`);

            if (errorData) {
                console.log(`📋 日志输出:`);
                // 只显示最后几行日志，避免过多输出
                const lines = errorData.trim().split('\n');
                const lastLines = lines.slice(-5);
                console.log(lastLines.join('\n'));
            }

            if (responseData) {
                try {
                    // 尝试解析JSON响应
                    const lines = responseData.trim().split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const response = JSON.parse(line);
                                if (response.result) {
                                    console.log(`✅ 接口上传成功!`);
                                    console.log(`📄 响应:`);
                                    if (response.result.content && response.result.content[0]) {
                                        const content = response.result.content[0].text;
                                        // 显示前200字符
                                        const truncated = content.length > 200 ? content.substring(0, 200) + '...' : content;
                                        console.log(truncated);
                                    }
                                    resolve(response);
                                    return;
                                } else if (response.error) {
                                    console.log(`❌ 接口上传失败: ${response.error.message}`);
                                    reject(new Error(response.error.message));
                                    return;
                                }
                            } catch (parseError) {
                                // 忽略JSON解析错误，继续尝试下一行
                            }
                        }
                    }
                    console.log(`❌ 未找到有效响应`);
                    reject(new Error('未找到有效响应'));
                } catch (error) {
                    console.log(`❌ 响应解析失败: ${error.message}`);
                    reject(error);
                }
            } else {
                console.log(`❌ 无响应数据`);
                reject(new Error('无响应数据'));
            }
        });

        // 设置超时
        setTimeout(() => {
            child.kill();
            reject(new Error('测试超时'));
        }, 30000);
    });
}

async function runAllUploads() {
    console.log(`🎯 开始上传 ${taskControllerApis.length} 个API接口...\n`);

    for (let i = 0; i < taskControllerApis.length; i++) {
        try {
            await runApiUploadTest(taskControllerApis[i]);
            console.log(`\n✅ 接口上传 ${i + 1}/${taskControllerApis.length} 完成`);
        } catch (error) {
            console.log(`\n❌ 接口上传 ${i + 1}/${taskControllerApis.length} 失败: ${error.message}`);
        }

        if (i < taskControllerApis.length - 1) {
            console.log('\n⏳ 等待 3 秒后上传下一个接口...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    console.log('\n🏁 所有API接口上传完成!');
}

// 运行测试
runAllUploads().catch(console.error); 