#!/usr/bin/env node

const { spawn } = require('child_process');

// 设置正确的环境变量
process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '9:4997d6402322b0b0363412faa07abadbbb5ac71a9f5ed2055364226a62769a99';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🔍 快速测试 YApi 连接...');

async function quickTest() {
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
                name: 'yapi_get_categories',
                arguments: { projectId: '9' }
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
            console.log(`退出码: ${code}`);

            if (responseData) {
                const lines = responseData.trim().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const response = JSON.parse(line);
                            if (response.result) {
                                console.log('✅ 连接成功!');
                                console.log('结果:', response.result.content?.[0]?.text || '无内容');
                                resolve(response);
                                return;
                            }
                        } catch (e) {
                            // 忽略
                        }
                    }
                }
            }

            console.log('❌ 连接失败');
            if (errorData) {
                console.log('错误信息:', errorData.split('\n').slice(-3).join('\n'));
            }
            reject(new Error('连接失败'));
        });

        setTimeout(() => {
            child.kill();
            reject(new Error('超时'));
        }, 15000);
    });
}

quickTest().catch(console.error); 