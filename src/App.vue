<template>
  <a-config-provider :locale="zhCN">
    <div class="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script setup>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
dayjs.locale("zh");
</script>

<style lang="less" scoped>
.app {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fb
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAFVJREFUSEtjfPn+238GJMDBxozMJZn949dfuB5GkOHiglyMJJtChIYhbPjHrz//83Oz0yZYRg3HlngYR4NlNFiIKFUgSkZTC9agGg0W7MEyWs1hCxcAF5pe5Ya82ZoAAAAASUVORK5CYII=)
    repeat center center/23px 23px;
}
</style>
