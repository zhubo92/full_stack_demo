// 引入依赖
module.exports = {
  outputDir: "dist", //build输出目录
  assetsDir: "static", //静态资源目录（js, css, img）
  lintOnSave: false, //是否开启eslint
  devServer: {
    open: false,
    host: "0.0.0.0",
    port: 3060,
    https: false,
    hotOnly: false,
    proxy: {
      "/api": {
        target: "http://192.168.175.110:10000", //后端服务的接口
        changeOrigin: true, // 虚拟的站点需要更换origin
        pathRewrite: {
          "/api": "" // 路径重写清空
        }
      }
    }
  }
};
