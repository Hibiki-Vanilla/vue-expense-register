<template>
  <div class="listPage">
    <!-- page nav -->
    <PageNav />
    <!-- title -->
    <a-card>
      <span class="pageTitle">
        <span class="pageTitleLine">{{ state.department }}</span
        >单位经费额度明细统计表</span
      >
    </a-card>
    <!-- mo tree -->
    <div class="moTreeRow" v-if="state.treeData.length > 0">
      <a-affix :offset-top="20">
        <a-button type="primary" @click="state.treeModalStatus = true">部门选择</a-button>
      </a-affix>
    </div>

    <!-- con -->
    <a-row>
      <a-col :lg="state.treeData.length > 0 ? 4 : 0" :xs="0">
        <a-card class="treeCard">
          <a-tree
            :tree-data="state.treeData"
            :selectedKeys="state.selectedKeys"
            :expandedKeys="state.expandedKeys"
            @select="onSelect"
            @expand="onExpand"
            :fieldNames="{
              key: 'unitId',
              title: 'unitName',
              children: 'children',
            }"
          >
          </a-tree>
        </a-card>
      </a-col>
      <a-col :lg="state.treeData.length > 0 ? 20 : 24" :xs="24">
        <!-- nav value -->
        <a-card class="navRow">
          <a-row>
            <NavItem :title="'期初结余'" :numValue="state.openingBalance" />
            <NavItem :title="'收入'" :numValue="state.income" />
            <NavItem :title="'支出'" :numValue="state.expenditure" />
            <NavItem :title="'结余'" :numValue="state.balance" />
          </a-row>
        </a-card>
        <!-- dep list -->
        <a-card class="navRow" v-if="state.depDataSource.length > 1">
          <div class="listTitle">
            <span> 单位经费表 </span>
          </div>
          <a-table
            bordered
            size="small"
            :data-source="state.depDataSource"
            :columns="depColumns"
            :scroll="{ x: 1400 }"
            :pagination="false"
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
              <template v-if="column.dataIndex === 'balance'">
                <div class="expenditure">{{ numEidt(record.balance) }}</div>
              </template>
            </template>
          </a-table>
        </a-card>
        <!-- list -->
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
            :data-source="state.dataSource"
            :columns="columns"
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
      </a-col>
    </a-row>

    <!-- modal -->
    <a-modal
      v-model:visible="state.treeModalStatus"
      :maskClosable="false"
      :footer="null"
      title="部门选择"
    >
      <a-tree
        :tree-data="state.treeData"
        :selectedKeys="state.selectedKeys"
        :expandedKeys="state.expandedKeys"
        @select="onSelect"
        @expand="onExpand"
        :fieldNames="{
          key: 'unitId',
          title: 'unitName',
          children: 'children',
        }"
      >
      </a-tree>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, reactive } from "@vue/runtime-core";
import { DownloadOutlined } from "@ant-design/icons-vue";
import PageNav from "@/components/PageNav.vue";
import NavItem from "@/components/NavItem.vue";
import { getConList, getUnitListSimple } from "@/api";
import { downExcelFile } from "@/utils/xlsx";
import dayjs from "dayjs";
const state = reactive({
  department: "全部",
  dataSource: [],
  depDataSource: [],
  treeData: [],
  selectedKeys: [0],
  expandedKeys: [0],
  tableLoading: false,
  openingBalance: 0,
  income: 0,
  expenditure: 0,
  balance: 0,

  // modal
  treeModalStatus: false,
});
const columns = [
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
const depColumns = [
  {
    title: "部门名",
    dataIndex: "unitName",
    align: "center",
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
    title: "结余",
    dataIndex: "balance",
    align: "center",
  },
];

// 获取列表
const getList = async (id) => {
  state.tableLoading = true;
  const res = await getConList({ unitId: id !== "0" ? id : null });
  if (res?.code === 1) {
    state.dataSource = res?.data?.detailsListVoList || [];
    state.depDataSource = res?.data?.amountSummaryVos || [];

    state.openingBalance = res?.data?.openingBalance;
    state.income = res?.data?.income;
    state.expenditure = res?.data?.expenditure;
    state.balance = res?.data?.balance;
  }
  state.tableLoading = false;
};
// 获取树
const getTree = async () => {
  const res = await getUnitListSimple();
  if (res?.code === 1) {
    state.treeData =
      res?.data.length > 0
        ? [
            {
              unitId: 0,
              unitName: "全部",
              children: res?.data,
            },
          ]
        : [];
  }
};

// 选择树
const onSelect = (selectedKeys, info) => {
  if (selectedKeys.length > 0) {
    getList(selectedKeys.toString());
    state.selectedKeys = selectedKeys;
    state.department = info.node.unitName;
    state.treeModalStatus = false;
  }
};

// 选择树展开
const onExpand = (keys) => {
  state.expandedKeys = keys;
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

// 初始化
onMounted(() => {
  getList("0");
  getTree(null);
});
</script>

<style lang="less" scoped>
.listPage {
  padding: 20px;

  // title
  .pageTitle {
    font-size: 24px;
    font-weight: bold;
    .pageTitleLine {
      position: relative;
    }
    .pageTitleLine:before {
      position: absolute;
      content: "";
      width: 100%;
      height: 2px;
      background: #40a9ff;
      left: 0;
      bottom: -2px;
    }
  }
  .moTreeRow {
    margin-top: 20px;
    display: none;
    justify-content: end;
  }
  @media (max-width: 992px) {
    .moTreeRow {
      display: flex;
    }
  }
  // nav
  .navRow {
    margin: 20px auto;
  }

  .treeCard {
    margin-top: 20px;
    margin-bottom: 20px;
    margin-right: 1vw;
    height: 100%;
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
