// 引入mysql数据库
var mysql = require('mysql')
// 数据库连接池的配置
var pool = mysql.createPool({
  connectionLimit: 10,  // 连接池的大小
  host: 'localhost', // 主机名
  user: 'root',  // 用户名
  password: 'zhubo92', // 密码
  port: '3307', // 端口号
  database: 'person_manage' // 数据库名称 在数据库里面建立了一个person_manage数据库，里面有很多表格
});
// 暴露连接池
module.exports = pool