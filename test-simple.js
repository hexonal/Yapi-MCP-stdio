#!/usr/bin/env node

const { spawn } = require('child_process');

// 设置环境变量
process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '0c046c9a0304c0be889c6d45a3bb7a39e117c90d64ab1e091c019a2e675de2d6';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🚀 开始简单测试 YApi MCP Server...');

async function testTool(toolName, params) {
    console.log(`\n📋 测试工具: ${toolName}`);
    console.log(`📝 参数: ${JSON.stringify(params, null, 2)}`);

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
                name: toolName,
                arguments: params
            }
        };

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

            if (responseData) {
                try {
                    const lines = responseData.trim().split('\n');
                    for (const line of lines) {
                        if (line.trim()) {
                            try {
                                const response = JSON.parse(line);
                                if (response.result) {
                                    console.log(`✅ 工具调用成功!`);
                                    if (response.result.content && response.result.content[0]) {
                                        console.log(`📄 结果: ${response.result.content[0].text}`);
                                    }
                                    resolve(response);
                                    return;
                                }
                            } catch (parseError) {
                                // 继续尝试下一行
                            }
                        }
                    }
                } catch (error) {
                    console.log(`❌ 解析失败: ${error.message}`);
                }
            }

            console.log(`❌ 测试失败`);
            if (errorData) {
                console.log(`📋 错误信息: ${errorData}`);
            }
            reject(new Error('测试失败'));
        });

        // 设置超时
        setTimeout(() => {
            child.kill();
            reject(new Error('测试超时'));
        }, 15000);
    });
}

async function main() {
    try {
        // 测试获取项目分类
        await testTool('yapi_get_categories', { projectId: '18' });

        console.log('\n✅ 所有测试完成!');
    } catch (error) {
        console.log(`\n❌ 测试过程中出错: ${error.message}`);
    }
}

main(); 