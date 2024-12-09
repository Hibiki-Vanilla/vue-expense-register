<template>
  <div class="pageNav" v-if="visibleStauts !== '0'">
    <a-menu
      v-model:selectedKeys="current"
      mode="horizontal"
      @click="onMenuClick"
    >
      <a-menu-item key="/list">
        <template #icon>
          <PieChartOutlined />
        </template>
        明细统计表
      </a-menu-item>

      <a-menu-item key="/finance">
        <template #icon>
          <FormOutlined />
        </template>
        数据录入
      </a-menu-item>

      <a-menu-item key="/maintain">
        <template #icon>
          <FormOutlined />
        </template>
        单位维护
      </a-menu-item>
      <!-- 
      <a-menu-item :key="item.path">
        <template #icon>
          <PieChartOutlined v-if="item.path === '/list'" />
          <FormOutlined v-if="item.path === '/finance'" />
          <SettingOutlined v-if="item.path === '/maintain'" />
        </template>
        {{ item.name }}
      </a-menu-item> -->
    </a-menu>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "@vue/runtime-core";
import {
  PieChartOutlined,
  FormOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
const router = useRouter();
const current = ref(["/list"]);
const visibleStauts = ref('0');

const navList = ref([
  { name: "明细统计表", path: "/list" },
  { name: "数据录入", path: "/finance" },
  { name: "单位维护", path: "/maintain" },
]);

watch(
  () => router.currentRoute.value,
  (val) => {
    const { path } = val;
    current.value = [path];
  },
  { immediate: true, deep: true }
);

// 跳转
const onMenuClick = (value) => {
  router.push(value.key);
};
onMounted(() => {
  visibleStauts.value = localStorage.getItem("de-writeState");
});
</script>

<style lang="less" scoped>
.pageNav {
  padding-bottom: 20px;
}
</style>
