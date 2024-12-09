<template>
  <div class="finance">
    <!-- page nav -->
    <PageNav />
    <!-- title -->
    <a-card class="marginBottomLine">
      <span class="pageTitle">单位经费额度数据录入</span>
    </a-card>

    <!-- table -->
    <a-card class="marginBottomLine">
      <a-table
        bordered
        size="small"
        :data-source="state.dataSource"
        :columns="columns"
        :loading="state.tableLoading"
        rowKey="unitId"
        :pagination="false"
        :expandedRowKeys="state.expandedRowKeys"
        @expand="tableExpand"
      >
        <template v-slot:headerCell="{ column }">
          <template v-if="column.dataIndex === 'unitName'">
            <span> 部门名 </span>
            <a-button size="small" type="text" @click="extendHand">
              <template #icon><ColumnHeightOutlined /></template>
            </a-button>
          </template>
        </template>

        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            <div class="name">{{ listName(record.deUnitCounterpartVos) }}</div>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="operation">
              <a-button type="link" size="small" @click="handDetails(record)"
                >详情</a-button
              >
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
    <!-- two table -->
    <a-card>
      <div class="listTitle">
        <span> 单位经费额度明细统计表 </span>
        <a-button type="primary" @click="onDownXlsx">
          <template #icon><DownloadOutlined /></template>
        </a-button>
      </div>
      <a-table
        bordered
        size="small"
        :data-source="state.twoDataSource"
        :loading="state.twoTableLoading"
        :columns="twoColumns"
        :scroll="{ x: 1400 }"
      >
        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'openingBalance'">
            <div class="openingBalance">
              {{ numEidt(record.openingBalance) }}
            </div>
          </template>
          <template v-if="column.dataIndex === 'income'">
            <div class="income">{{ numEidt(record.income) }}</div>
          </template>
          <template v-if="column.dataIndex === 'expenditure'">
            <div class="expenditure">{{ numEidt(record.expenditure) }}</div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, toRaw } from "@vue/runtime-core";
import PageNav from "@/components/PageNav.vue";
import { DownloadOutlined, ColumnHeightOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { getUnitList, getDetailslistAll } from "@/api";
import { downExcelFile } from "@/utils/xlsx";
import dayjs from "dayjs";
const router = useRouter();

const state = reactive({
  dataSource: [],
  twoDataSource: [],
  expandedRowKeys: [],
  tableLoading: false,
  twoTableLoading: false,
  validateInfos: {},
  extendsStatus: false,
});
const columns = [
  {
    title: "部门名",
    dataIndex: "unitName",
  },
  {
    title: "部门对接人",
    dataIndex: "name",
  },
  {
    title: "操作",
    dataIndex: "operation",
    width: document.documentElement.clientWidth > 700 ? 200 : 67,
  },
];
const twoColumns = [
  {
    title: "发生日期",
    dataIndex: "dateStr",
    align: "center",
  },
  {
    title: "部门名",
    dataIndex: "unitName",
    align: "center",
  },
  {
    title: "摘要",
    dataIndex: "abstractInfo",
    align: "center",
    ellipsis: true,
  },
  {
    title: "期初结余",
    dataIndex: "openingBalance",
    align: "center",
  },
  {
    title: "收入",
    dataIndex: "income",
    align: "center",
  },
  {
    title: "支出",
    dataIndex: "expenditure",
    align: "center",
  },
  {
    title: "登记人",
    dataIndex: "userName",
    align: "center",
  },
  {
    title: "登记日期",
    dataIndex: "createTime",
    align: "center",
  },
];
// 列表 人员名+工号
const listName = (value) => {
  let text = [];
  value.map((item) => {
    text.push(item.counterpartName);
  });
  return text.join("、");
};

const handDetails = (record) => {
  router.push({
    name: "financeDetails",
    params: { name: record.unitName, id: record.unitId },
  });
};

// 获取列表
const getUnit = async () => {
  state.tableLoading = true;
  const res = await getUnitList();
  if (res?.code === 1) {
    state.dataSource = res.data || [];
  }
  state.tableLoading = false;
};

// 获取列表
const getlistAll = async () => {
  state.twoTableLoading = true;
  const res = await getDetailslistAll();
  if (res?.code === 1) {
    state.twoDataSource = res?.data?.detailsListVoList || [];
  }
  state.twoTableLoading = false;
};

const numEidt = (value) => {
  if (value !== undefined) {
    let text = `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return text;
  } else {
    return "-";
  }
};

// 导出当前表
const onDownXlsx = () => {
  const name = state.department;
  const date = dayjs().format("YYYY-MM-DD");
  const header = [
    "日期",
    "部门名",
    "摘要",
    "期初结余",
    "收入",
    "支出",
    "登记人",
    "登记日期",
  ];
  downExcelFile(name, state.dataSource, date, header);
};

const tableExpand = (expanded, record) => {
  if (expanded) {
    state.expandedRowKeys = [...state.expandedRowKeys, record.unitId];
  } else {
    if (state.expandedRowKeys.length) {
      state.expandedRowKeys = state.expandedRowKeys.filter((v) => {
        return v != record.unitId;
      });
    }
  }
};

const extendHand = () => {
  let list = [];
  if (state.extendsStatus) {
    state.expandedRowKeys = [];
  } else {
    state.dataSource.map((item) => {
      list.push(item.unitId);
      if (item?.children) {
        item?.children.map((dep) => {
          list.push(dep.unitId);
        });
      }
    });
    state.expandedRowKeys = list;
  }

  state.extendsStatus = !state.extendsStatus;
};

// 初始化
onMounted(() => {
  getUnit();
  getlistAll();
});
</script>

<style lang="less" scoped>
.finance {  
  box-sizing: border-box;
  padding: 20px;
  // title
  .pageTitle {
    font-size: 24px;
    font-weight: bold;
  }
  .marginBottomLine {
    margin-bottom: 20px;
  }

  // list
  .listTitle {
    font-size: 16px;
    font-weight: bold;
    padding-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
