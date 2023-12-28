// 引入express插件包并生成一个实例app
const express = require('express')
const app = express()
const os = require('os'); // 引入os模块

// 使用body-parser中间件解析post请求主体
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const Router = require('./router') // 引入分模块管理的路由

// 路由分模块
app.use(Router) 

// 获取本地IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}


// 在9999端口上启动后端服务
app.listen(10000, (req,res) => {
    console.log('后端服务端口地址为：localhost:10000');
    console.log(`后端服务端口地址为：${getLocalIP()}:10000`);
})