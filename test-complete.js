#!/usr/bin/env node

const { spawn } = require('child_process');

// 设置环境变量 - 项目ID=9
process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '9:4997d6402322b0b0363412faa07abadbbb5ac71a9f5ed2055364226a62769a99';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🎯 YApi MCP Server 完整工具测试');
console.log('=====================================');
console.log('📊 配置信息:');
console.log(`   Base URL: ${process.env.YAPI_BASE_URL}`);
console.log(`   Project ID: 9`);
console.log(`   Log Level: ${process.env.YAPI_LOG_LEVEL}`);
console.log('');

const testSuite = [
    {
        name: '1. 获取项目列表',
        description: '列出当前token可访问的所有项目',
        tool: 'yapi_list_projects',
        params: {}
    },
    {
        name: '2. 获取项目分类',
        description: '获取项目ID=9的接口分类',
        tool: 'yapi_get_categories',
        params: { projectId: '9' }
    },
    {
        name: '3. 搜索所有接口',
        description: '搜索项目中的所有接口',
        tool: 'yapi_search_apis',
        params: { projectKeyword: '', limit: 20 }
    },
    {
        name: '4. 搜索任务相关接口',
        description: '搜索包含"task"关键词的接口',
        tool: 'yapi_search_apis',
        params: { projectKeyword: 'task', limit: 10 }
    },
    {
        name: '5. 获取特定接口详情',
        description: '获取接口ID为1209的详细信息',
        tool: 'yapi_get_api',
        params: { apiId: '1209' }
    }
];

async function executeTest(test) {
    console.log(`\n🔍 执行测试: ${test.name}`);
    console.log(`📝 描述: ${test.description}`);
    console.log(`⚙️  工具: ${test.tool}`);
    console.log(`📋 参数: ${JSON.stringify(test.params, null, 2)}`);

    return new Promise((resolve, reject) => {
        const child = spawn('node', ['./dist/cli.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env
        });

        let responseData = '';
        let errorData = '';

        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: test.tool,
                arguments: test.params
            }
        };

        child.stdin.write(JSON.stringify(request) + '\n');
        child.stdin.end();

        child.stdout.on('data', (data) => {
            responseData += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        child.on('close', (code) => {
            console.log(`\n💻 进程退出码: ${code}`);

            if (responseData) {
                try {
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
                                        // 适当截取输出长度
                                        const maxLength = 1000;
                                        const truncated = content.length > maxLength ?
                                            content.substring(0, maxLength) + '\n...(输出已截取)' : content;
                                        console.log(truncated);
                                    }
                                    console.log('\n' + '='.repeat(50));
                                    resolve(response);
                                    return;
                                } else if (response.error) {
                                    console.log(`❌ 测试失败: ${response.error.message}`);
                                    console.log('\n' + '='.repeat(50));
                                    reject(new Error(response.error.message));
                                    return;
                                }
                            } catch (parseError) {
                                // 继续尝试解析下一行
                            }
                        }
                    }
                    console.log(`❌ 未找到有效的JSON响应`);
                    console.log(`原始输出: ${responseData.substring(0, 200)}...`);
                    reject(new Error('未找到有效响应'));
                } catch (error) {
                    console.log(`❌ 响应解析失败: ${error.message}`);
                    reject(error);
                }
            } else {
                console.log(`❌ 无响应数据`);
                if (errorData) {
                    console.log(`错误输出: ${errorData.split('\n').slice(-3).join('\n')}`);
                }
                reject(new Error('无响应数据'));
            }
        });

        // 30秒超时
        setTimeout(() => {
            child.kill();
            reject(new Error('测试超时'));
        }, 30000);
    });
}

async function runCompleteTest() {
    console.log(`🚀 开始执行 ${testSuite.length} 个测试...\n`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < testSuite.length; i++) {
        try {
            await executeTest(testSuite[i]);
            successCount++;
            console.log(`✅ 测试 ${i + 1}/${testSuite.length} 完成`);
        } catch (error) {
            failureCount++;
            console.log(`❌ 测试 ${i + 1}/${testSuite.length} 失败: ${error.message}`);
        }

        // 测试间隔
        if (i < testSuite.length - 1) {
            console.log('\n⏳ 等待 2 秒后执行下一个测试...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('\n📊 测试总结');
    console.log('=====================================');
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${failureCount} 个`);
    console.log(`📊 成功率: ${((successCount / testSuite.length) * 100).toFixed(1)}%`);
    console.log('\n🏁 所有测试完成!');
}

// 运行测试
runCompleteTest().catch(console.error); 