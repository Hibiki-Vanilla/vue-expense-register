<template>
  <div class="detailsPage">
    <!-- top nav -->
    <a-row class="topNav" align="middle">
      <a-button @click="router.push('/finance')">返回列表</a-button>
    </a-row>
    <!-- title -->
    <a-card class="marginBottomLine">
      <span class="pageTitle">
        <span class="pageTitleLine">{{ state.depName }}</span
        >经费额度数据</span
      >
    </a-card>
    <!-- nav value -->
    <a-card class="navRow">
      <a-row>
        <NavItem :title="'期初结余'" :numValue="state.openingBalance" />
        <NavItem :title="'收入'" :numValue="state.income" />
        <NavItem :title="'支出'" :numValue="state.expenditure" />
        <NavItem :title="'结余'" :numValue="state.balance" />
      </a-row>
    </a-card>

    <!-- table -->
    <a-card>
      <a-row justify="end" class="marginBottomLine">
        <a-button type="primary" @click="handNewItem">新增</a-button>
      </a-row>
      <a-table
        bordered
        size="small"
        :data-source="state.dataSource"
        :columns="columns"
        :loading="state.tableLoading"
        :scroll="{ x: 1400 }"
        rowKey="id"
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

          <template v-if="column.dataIndex === 'operation'">
            <div class="operation" v-if="record.unitId === state.unitId">
              <a-button type="link" size="small" @click="handEditItem(record)"
                >编辑</a-button
              >
              <a-button type="link" size="small" danger @click="handDel(record)"
                >删除</a-button
              >
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- drawer -->
    <a-drawer
      :visible="state.drawerVisible"
      class="custom-class"
      :title="state.drawerTitle"
      placement="right"
      :closable="false"
    >
      <a-form :model="formState" autocomplete="off">
        <a-form-item label="日期" name="age" v-bind="validateInfos.age">
          <a-date-picker v-model:value="formState.age" style="width: 277px" />
        </a-form-item>
        <a-form-item label="类型" name="radio" v-bind="validateInfos.radio">
          <a-radio-group v-model:value="formState.radio">
            <a-radio value="0">期初结余</a-radio>
            <a-radio value="1">收入</a-radio>
            <a-radio value="2">支出</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="金额" name="money" v-bind="validateInfos.money">
          <a-input-number
            prefix="￥"
            v-model:value="formState.money"
            :formatter="limitDec"
            :parser="limitDec"
            style="width: 277px"
          />
        </a-form-item>
        <a-form-item label="摘要" name="text" v-bind="validateInfos.text">
          <a-textarea
            v-model:value="formState.text"
            show-count
            :maxlength="200"
            :rows="3"
          />
        </a-form-item>
      </a-form>

      <template v-slot:footer>
        <a-row justify="end">
          <a-button @click="offDrawer" style="margin-right: 10px"
            >取消</a-button
          >
          <a-button
            type="primary"
            :loading="state.drawerLoading"
            @click="okDrawr"
            >确定</a-button
          >
        </a-row>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { createVNode } from "vue";
import dayjs from "dayjs";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { onMounted, reactive, toRaw } from "@vue/runtime-core";
import { useRouter, useRoute } from "vue-router";
import { Form, Modal, message } from "ant-design-vue";
import {
  getDetailsList,
  postDetailsAdd,
  delDetailsDel,
  putDetailsUpdate,
} from "@/api";
import NavItem from "@/components/NavItem.vue";
const router = useRouter();
const useForm = Form.useForm;

const formState = reactive({
  age: null,
  text: "",
  money: null,
  radio: null,
});
const ruleState = reactive({
  age: [{ required: true, message: "请选择日期" }],
  text: [{ required: true, message: "请输入摘要" }],
  money: [{ required: true, message: "请输入金额" }],
  radio: [{ required: true, message: "请选择类型" }],
});
const { resetFields, validate, validateInfos } = useForm(formState, ruleState);

const state = reactive({
  dataSource: [],
  depName: "",
  tableLoading: false,

  drawerVisible: false,
  drawerTitle: "",
  unitId: "",
  validateInfos: {},

  // edit
  rowEidtValue: null,
  drawerLoading: false,

  // nav
  openingBalance: 0,
  income: 0,
  expenditure: 0,
  balance: 0,
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
      ellipsis: true
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
  {
    title: "操作",
    dataIndex: "operation",
    fixed: "right",
    width: document.documentElement.clientWidth > 700 ? 200 : 76,
  },
];

const numEidt = (value) => {
  if (value !== undefined) {
    let text = `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return text;
  } else {
    return "-";
  }
};

const limitDec = (value) => {
  const reg = /^(\-)*(\d+)\.(\d\d).*$/;
  if (typeof value === "string") {
    return !isNaN(Number(value)) ? value.replace(reg, "$1$2.$3") : "";
  } else if (typeof value === "number") {
    return !isNaN(value) ? String(value).replace(reg, "$1$2.$3") : "";
  } else {
    return "";
  }
};
// 新建
const handNewItem = (record) => {
  state.drawerTitle = "新建数据录入";
  state.drawerVisible = true;
};

// 编辑
const handEditItem = (record) => {
  const date = dayjs(record.age);
  formState.age = date;
  formState.money = record.openingBalance
    ? record.openingBalance
    : record.income
    ? record.income
    : record.expenditure;
  formState.radio = record.openingBalance ? "0" : record.income ? "1" : "2";
  formState.text = record.abstractInfo;
  state.rowEidtValue = record;
  state.drawerTitle = "编辑数据录入";
  state.drawerVisible = true;
};

// 取消
const offDrawer = () => {
  resetFields();
  state.drawerVisible = false;
};

// 确定
const okDrawr = () => {
  validate()
    .then(async () => {
      let data = {
        unitId: state.unitId,
        dateStr: dayjs(formState.age).format("YYYY-MM-DD"),
        type: formState.radio,
        amount: formState.money,
        abstractInfo: formState.text.trim(),
      };
      state.drawerLoading = true;
      if (state.drawerTitle === "编辑数据录入") {
        data.id = state.rowEidtValue.id;
        const res = await putDetailsUpdate(data);
        if (res?.code === 1) {
          message.success("更新成功");
          getList(state.unitId);
          offDrawer();
        }
        state.drawerLoading = false;
      } else {
        const res = await postDetailsAdd(data);
        if (res?.code === 1) {
          message.success("新建成功");
          getList(state.unitId);
          offDrawer();
        }
        state.drawerLoading = false;
      }
    })
    .catch((err) => {
      console.log("error", err);
    });
  //   const res = await putPromotionUpdateComment(data);
};

// 删除
const handDel = (record) => {
  Modal.confirm({
    title: "是否删除此条数据?",
    icon: createVNode(ExclamationCircleOutlined),
    okType: "danger",
    okText: "删除",
    cancelText: "取消",
    onOk() {
      return new Promise(async (resolve, reject) => {
        const res = await delDetailsDel(record.id);
        if (res?.code === 1) {
          message.success("删除成功");
          setTimeout(resolve, 0);
          getList(state.unitId);
        }
      }).catch(() => console.log("Oops errors!"));
    },
    onCancel() {},
  });
};

// 获取列表
const getList = async (id) => {
  state.tableLoading = true;
  const res = await getDetailsList(id);
  if (res?.code === 1) {
    state.dataSource = res?.data?.detailsListVoList || [];
    state.openingBalance = res?.data?.openingBalance;
    state.income = res?.data?.income;
    state.expenditure = res?.data?.expenditure;
    state.balance = res?.data?.balance;
  }
  state.tableLoading = false;
};
// 初始化
onMounted(() => {
  state.depName = useRoute().params.name;
  state.unitId = useRoute().params.id;
  getList(useRoute().params.id);
});
</script>

<style lang="less" scoped>
.detailsPage {
  padding: 20px;
  // topNav
  .topNav {
    margin-bottom: 20px;
    background: #fff;
    height: 45px;
    padding-left: 20px;
  }
  .marginBottomLine {
    margin-bottom: 20px;
  }
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

  // nav
  .navRow {
    margin: 20px auto;
  }
}
</style>
