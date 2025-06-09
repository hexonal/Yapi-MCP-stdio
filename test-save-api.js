#!/usr/bin/env node

const { spawn } = require('child_process');

// 设置环境变量
process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '18:0c046c9a0304c0be889c6d45a3bb7a39e117c90d64ab1e091c019a2e675de2d6';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🧪 测试 yapi_save_api 工具...');

// 先创建一个分类，然后添加接口
const tests = [
    {
        name: '新增测试接口',
        tool: 'yapi_save_api',
        params: {
            projectId: '18',
            catid: '1',  // 使用默认分类ID
            title: '测试接口 - 获取用户信息',
            path: '/api/test/user',
            method: 'GET',
            status: 'done',
            desc: '这是一个测试接口，用于验证YApi MCP工具的功能',
            req_query: JSON.stringify([
                { name: 'userId', desc: '用户ID', required: '1' },
                { name: 'includeProfile', desc: '是否包含用户详细信息', required: '0' }
            ]),
            res_body_type: 'json',
            res_body: JSON.stringify({
                code: 200,
                message: 'success',
                data: {
                    userId: 'string',
                    username: 'string',
                    email: 'string',
                    profile: 'object'
                }
            }),
            markdown: '## 接口说明\n\n这个接口用于获取用户基本信息。\n\n### 请求参数\n\n- userId: 必填，用户唯一标识\n- includeProfile: 可选，是否返回详细资料'
        }
    }
];

async function runSaveApiTest(test) {
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

        console.log(`📝 发送请求...`);

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
                console.log(errorData);
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
                                    console.log(`✅ 测试成功!`);
                                    console.log(`📄 响应内容:`);
                                    if (response.result.content && response.result.content[0]) {
                                        const content = response.result.content[0].text;
                                        console.log(content);
                                    }
                                    resolve(response);
                                    return;
                                } else if (response.error) {
                                    console.log(`❌ 工具调用错误: ${response.error.message}`);
                                    reject(new Error(response.error.message));
                                    return;
                                }
                            } catch (parseError) {
                                // 忽略JSON解析错误，继续尝试下一行
                            }
                        }
                    }
                    console.log(`❌ 未找到有效响应`);
                    console.log(`📋 原始输出: ${responseData}`);
                    reject(new Error('未找到有效响应'));
                } catch (error) {
                    console.log(`❌ 响应解析失败: ${error.message}`);
                    console.log(`📋 原始输出: ${responseData}`);
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

async function runTest() {
    try {
        await runSaveApiTest(tests[0]);
        console.log('\n🎉 保存API接口测试完成!');
    } catch (error) {
        console.log(`\n❌ 测试失败: ${error.message}`);
    }
}

runTest().catch(console.error); 