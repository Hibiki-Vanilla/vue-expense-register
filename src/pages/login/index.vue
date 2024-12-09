<template>
  <div class="loginPage">
    <a-spin size="large" tip="登录中..." v-if="state.spinning" />
    <div class="textRow" v-else>{{ state.msg }}</div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "@vue/runtime-core";
import dd from "dingtalk-jsapi";
import { message } from "ant-design-vue";
import { login, jsapi } from "@/api";
import { useRouter } from "vue-router";
const router = useRouter();
const state = reactive({
  spinning: true,
  msg: "",
  time: null,
  signature: "",
});
// 授权
const getJsapi = async () => {
  const time = parseInt(new Date().getTime() / 1000) + "";
  state.time = time;
  const res = await jsapi({
    url: window.location.href,
    timeStamp: time,
    nonceStr: "maintain",
  });
  if (res?.code === 1) {
    state.signature = res.data;
    drawerDDJsApiEidt();
  }
};
// / 抽屉 dd授权
const drawerDDJsApiEidt = () => {
  dd.ready(function () {
    dd.config({
      agentId: "2400140713", // 必填，微应用ID
      corpId: "ding6f019bea31ee712735c2f4657eb6378f", //必填，企业ID
      timeStamp: state.time, // 必填，生成签名的时间戳
      nonceStr: "maintain", // 必填，自定义固定字符串。
      signature: state.signature, // 必填，签名
      type: 0, //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
      jsApiList: ["biz.contact.choose", "biz.contact.departmentsPicker"], // 必填，需要使用的jsapi列表，注意：不要带dd。
      onSuccess: function (res) {
        router.push("/list");
        //  router.push("/finance");
      },
    });

    dd.error(function (err) {
      console.log(err);
      // alert("dd error: " + JSON.stringify(err));
    });
  });
};

// 正式
const userDDLogin = async (code) => {
  const res = await login(code);
  if (res?.code === 1) {
    const token = res?.data?.token;
    const writeState = res?.data?.writeState;
    localStorage.setItem("de-token", token);
    localStorage.setItem("de-writeState", writeState);
    if (writeState) {
      getJsapi();
    } else {
      router.push("/list");
    }
  } else {
    message.error("钉钉免登授权失败, 请联系管理员");
    state.spinning = false;
    state.msg = res.msg;
  }
};

//  开发
const devLogin = async () => {
  const res = await login("276539073937397192");
  if (res?.code === 1) {
    const token = res?.data?.token;
    const writeState = res?.data?.writeState;
    localStorage.setItem("de-token", token);
    localStorage.setItem("de-writeState", writeState);
    // if(writeState){
    //   getJsapi()
    // }else{
    router.push("/list");
    // }
  } else {
    message.error("钉钉免登授权失败, 请联系管理员");
    state.spinning = false;
    state.msg = res.msg;
  }
};

// 初始化
onMounted(() => {
  message.config({
    maxCount: 1,
  });

  // true正式 false开发

  if (true) {
    if (dd.env.platform.toLowerCase() === "notindingtalk") {
      message.warn("请使用钉钉环境访问");
      state.msg = "请使用钉钉环境访问";
      state.spinning = false;
      return false;
    } else {
      // 正式环境, 则进行授权, 获取微应用免登授权码
      dd.ready(function () {
        dd.runtime.permission.requestAuthCode({
          corpId: "ding6f019bea31ee712735c2f4657eb6378f", // 企业 ID
          onSuccess: function (info) {
            // 通过该免登授权码可以获取用户身份 info.code
            userDDLogin(info.code);
          },
          onFail: function (err) {
            state.spinning = false;
            message.error("钉钉免登授权失败, 请联系管理员");
          },
        });
      });
    }
  } else {
    devLogin();
  }
});
</script>

<style lang="less" scoped>
.loginPage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
}
.textRow {
  font-size: 22px;
  font-weight: bold;
}
</style>
