import axios from "axios";
import { message } from "ant-design-vue";


const service = axios.create({
    timeout: 10000,
    headers: {
        "Content-Type": "application/json;charset=UTF-8", // 'application/x-www-form-urlencoded;charset=UTF-8'
    },
});

// 请求拦截
service.interceptors.request.use((config) => {
        const token = localStorage.getItem("de-token") || "";
        token && (config.headers.token = token);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 返回拦截
service.interceptors.response.use(
    (response) => {
        const res = response.data;
        if (res.code === 401) {
            const url = location.origin;
            window.location.replace(url);
        }
        if (res.code === 1) {
            return res;
        } else {
            message.error(res.msg || "请求失败");
            return res;
        }
    },
    (error) => {
        const { response } = error;
        message.error("网络请求异常，请稍后重试!");
        return response;
    }
);
export default service;