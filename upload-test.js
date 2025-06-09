#!/usr/bin/env node

const { spawn } = require('child_process');

process.env.YAPI_BASE_URL = 'https://yapi.kaka.email';
process.env.YAPI_TOKEN = '9:4997d6402322b0b0363412faa07abadbbb5ac71a9f5ed2055364226a62769a99';
process.env.YAPI_LOG_LEVEL = 'info';

console.log('🎯 测试上传基于TaskDispositionController的新接口');
console.log('项目: network-extras-api (ID: 9)');

const apiData = {
    projectId: '9',
    catid: '1',
    title: '获取任务执行状态',
    path: '/api/task/execution/status',
    method: 'GET',
    desc: '获取任务执行状态，基于TaskDispositionController设计',
    query: [
        {
            name: 'taskId',
            desc: '任务ID',
            required: '1',
            example: 'TASK_001'
        }
    ],
    resBody: JSON.stringify({
        code: 200,
        message: "获取成功",
        data: {
            taskId: "TASK_001",
            status: "RUNNING",
            progress: 75,
            startTime: "2024-01-01 10:00:00",
            estimatedEndTime: "2024-01-01 12:00:00"
        }
    }, null, 2)
};

function testUpload() {
    console.log('开始上传...');

    const child = spawn('node', ['./dist/cli.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env
    });

    const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
            name: 'yapi_save_api',
            arguments: apiData
        }
    };

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();

    child.stdout.on('data', (data) => {
        console.log('输出:', data.toString());
    });

    child.stderr.on('data', (data) => {
        console.log('错误:', data.toString());
    });

    child.on('close', (code) => {
        console.log(`进程结束，退出码: ${code}`);
    });
}

testUpload(); 