import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter) // 注册路由

const router = new VueRouter({
    mode: 'history', // hash
    routes: [
        {
            path: "/",
            redirect: "/homepage",
        },
        {
            path: "/homepage",
            component: resolve => require(['@/views/homepage.vue'], resolve),
            meta: {
                name: "homepage"
            }
        },
        {
            // 会匹配所有路径，这里定义一个404页面
            path: '*',
            component: resolve => require(['@/views/404.vue'], resolve),
            meta: {
                name: "404"
            },
            // redirect: "/homepage",  // 当然，也可以重定向到主页页面
        }
    ]
})
export default router