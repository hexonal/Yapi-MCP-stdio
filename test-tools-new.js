#!/usr/bin/env node

const { spawn } = require('child_process');

// 设置新的环境变量
process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '4997d6402322b0b0363412faa07abadbbb5ac71a9f5ed2055364226a62769a99';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🚀 开始测试 YApi MCP Server 工具 (项目ID=9)...');
console.log('📊 配置信息:');
console.log(`   - Base URL: ${process.env.YAPI_BASE_URL}`);
console.log(`   - Project ID: 9`);
console.log(`   - Log Level: ${process.env.YAPI_LOG_LEVEL}`);
console.log('');

// 测试工具列表
const tests = [
    {
        name: '1. 列出项目信息 (yapi_list_projects)',
        tool: 'yapi_list_projects',
        params: {}
    },
    {
        name: '2. 获取项目分类 (yapi_get_categories)',
        tool: 'yapi_get_categories',
        params: { projectId: '9' }
    },
    {
        name: '3. 搜索API接口 (yapi_search_apis)',
        tool: 'yapi_search_apis',
        params: { projectKeyword: '', limit: 10 }
    },
    {
        name: '4. 搜索特定接口 (yapi_search_apis with keyword)',
        tool: 'yapi_search_apis',
        params: { projectKeyword: 'task', limit: 5 }
    }
];

async function runTest(test) {
    console.log(`\n📋 测试: ${test.name}`);
    console.log(`🔧 工具: ${test.tool}`);
    console.log(`📝 参数: ${JSON.stringify(test.params, null, 2)}`);

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
                                        // 截取前800字符避免输出过长
                                        const truncated = content.length > 800 ? content.substring(0, 800) + '...' : content;
                                        console.log(truncated);
                                    }
                                    resolve(response);
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

async function runAllTests() {
    console.log(`🎯 开始执行 ${tests.length} 个测试...\n`);

    for (let i = 0; i < tests.length; i++) {
        try {
            await runTest(tests[i]);
            console.log(`\n✅ 测试 ${i + 1}/${tests.length} 完成`);
        } catch (error) {
            console.log(`\n❌ 测试 ${i + 1}/${tests.length} 失败: ${error.message}`);
        }

        if (i < tests.length - 1) {
            console.log('\n⏳ 等待 2 秒后执行下一个测试...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('\n🏁 所有测试完成!');
}

// 运行测试
runAllTests().catch(console.error); 