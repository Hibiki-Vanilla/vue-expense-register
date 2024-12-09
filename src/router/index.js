import {
    createRouter,
    createWebHistory
} from "vue-router";
import dd from "dingtalk-jsapi";
export const routes = [{
        path: "/",
        name: "login",
        component: () => import("@/pages/login/index.vue"),
        meta: {
            title: "登录",
        }
    },
    {
        path: "/list",
        name: "list",
        component: () => import("@/pages/list/index.vue"),
        meta: {
            title: "列表",
        }
    },
    {
        path: "/finance",
        name: "finance",
        component: () => import("@/pages/finance/index.vue"),
        meta: {
            title: "数据录入",
        }
    },
    {
        path: "/financeDetails/:name/:id",
        name: "financeDetails",
        component: () => import("@/pages/financeDetails/index.vue"),
        props: { newsletterPopup: false },
        meta: {
            title: "详情",
        }
    },
    {
        path: "/maintain",
        name: "maintain",
        component: () => import("@/pages/maintain/index.vue"),
        meta: {
            title: "单位维护",
        }
    },
];

const router = createRouter({
    history: createWebHistory(), // history 模式则使用 createWebHistory()
    routes,
    scrollBehavior: () => ({
        left: 0,
        top: 0
    }),
});

// 路由全局前置守卫
router.beforeEach((to, from, next) => {
    next();
});
router.afterEach((to, from, next) => {
    if (dd.env.platform.toLowerCase() !== "notindingtalk") {
      dd.biz.navigation.setTitle({
        title: to.meta.title || "", //控制标题文本，空字符串表示显示默认文本
      });
    }
    document.title = to.meta.title;
  });

export default router;