<template>
  <div class="maintain">
    <!-- page nav -->
    <PageNav />
    <!-- title -->
    <a-card class="marginBottomLine">
      <span class="pageTitle">组织架构与对接人维护</span>
    </a-card>
    <!-- list -->
    <a-card>
      <a-row justify="end" class="marginBottomLine">
        <a-button type="primary" @click="handNewItem(null)">新建一级部门</a-button>
      </a-row>
      <a-table
        bordered
        size="small"
        :data-source="state.dataSource"
        :columns="columns"
        :loading="state.tableLoading"
        rowKey="unitId"
        :expandedRowKeys="state.expandedRowKeys"
        @expand="tableExpand"
        :pagination="false"
        :scroll="{ x: 1400 }"
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
              <a-button type="link" size="small" @click="handNewItem(record)"
                >新建</a-button
              >
              <a-button type="link" size="small" @click="handEditItem(record)"
                >编辑</a-button
              >
              <a-button
                type="link"
                danger
                size="small"
                @click="handDel(record)"
                :disabled="record?.children?.length > 0 ? true : false"
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
        <a-form-item label="部门名" name="depName" v-bind="validateInfos.depName">
          <a-input-group compact>
            <a-input
              v-model:value="formState.depName"
              :maxlength="20"
              style="width: calc(100% - 32px)"
            />
            <a-button type="primary" @click="complexPicker">
              <template #icon>
                <PlusOutlined />
              </template>
            </a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item label="对接人" name="name" v-bind="validateInfos.name">
          <a-input-group compact>
            <a-select
              v-model:value="formState.name"
              :open="false"
              :showSearch="false"
              mode="multiple"
              style="width: calc(100% - 32px)"
            ></a-select>
            <a-button type="primary" @click="contactChoose">
              <template #icon>
                <PlusOutlined />
              </template>
            </a-button>
          </a-input-group>
        </a-form-item>
      </a-form>

      <template v-slot:footer>
        <a-row justify="end">
          <a-button @click="offDrawer" style="margin-right: 10px">取消</a-button>
          <a-button type="primary" :loading="state.drawerLoading" @click="okDrawr"
            >确定</a-button
          >
        </a-row>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { createVNode } from "vue";
import { onMounted, reactive } from "@vue/runtime-core";
import {
  PlusOutlined,
  ExclamationCircleOutlined,
  ColumnHeightOutlined,
} from "@ant-design/icons-vue";
import { Form, Modal, message } from "ant-design-vue";
import PageNav from "@/components/PageNav.vue";
import dd, { error, runtime } from "dingtalk-jsapi";
import { jsapi, getUnitList, postUnitDe, delUnitDel, putUnitUpdate } from "@/api";

const formState = reactive({
  depName: "",
  name: [],
});
const useForm = Form.useForm;

const ruleState = reactive({
  depName: [{ required: true, message: "请输入部门名" }],
  name: [{ required: true, message: "请选择对接人" }],
});
const { resetFields, validate, validateInfos } = useForm(formState, ruleState);
const state = reactive({
  dataSource: [],
  expandedRowKeys: [],
  extendsStatus: false,
  tableLoading: true,
  drawerVisible: false,
  drawerTitle: "新增",
  validateInfos: {},

  // edit
  rowEditValue: {},
  drawerLoading: false,
  // jsapi
  time: null,
  signature: "",
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

// 新建状态判断
const newStatus = (value) => {
  let type = false;
  state.dataSource.map((item) => {
    if (item.children) {
      item.children.map((child) => {
        if (child.children) {
          child.children.map((dep) => {
            if (dep.unitId === value) {
              type = true;
            }
          });
        }
      });
    }
  });
  return type;
};
// 列表 人员名+工号
const listName = (value) => {
  let text = [];
  value.map((item) => {
    text.push(item.counterpartName);
  });
  return text.join("、");
};

// 抽屉 dd授权
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
    });

    dd.error(function (err) {
      console.log(err);
      // alert("dd error: " + JSON.stringify(err));
    });
  });
};

// 新建
const handNewItem = (record) => {
  const id = record?.unitId || null;
  if (id) {
    state.drawerTitle = "新建子部门";
  } else {
    state.drawerTitle = "新建一级部门";
  }
  state.rowEditValue = record;
  state.drawerVisible = true;
};
// 编辑
const handEditItem = (record) => {
  formState.depName = record.unitName;
  let list = [];
  record.deUnitCounterpartVos.map((item) => {
    list.push({ label: item.counterpartName, value: item.counterpartId });
  });

  formState.name = list;
  state.rowEditValue = record;
  state.drawerTitle = "编辑";
  state.drawerVisible = true;
};

// 部门唤醒选择
const complexPicker = () => {
  dd.biz.contact.departmentsPicker({
    title: "部门选择",
    corpId: "ding6f019bea31ee712735c2f4657eb6378f",
    multiple: false,
    limitTips: "超出了", //超过限定人数返回提示
    maxUsers: 0,
    pickedUsers: [],
    pickedDepartments: [],
    disabledUsers: [],
    disabledDepartments: [],
    requiredUsers: [],
    requiredDepartments: [],
    permissionType: "GLOBAL",
    agentId: "2400140713", // 必填，微应用ID
    responseUserOnly: false,
    startWithDepartmentId: 0,
    onSuccess: function (res) {
      formState.depName = res.departments[0].name;
    },
    onFail: function (err) {
      console.log(err);
    },
  });
};

// 对接人唤醒选择
const contactChoose = () => {
  const usersList = formState.name.map((item) => {
    return item.value;
  });
  dd.biz.contact.choose({
    multiple: true,
    users: usersList,
    max: 10,
    corpId: "ding6f019bea31ee712735c2f4657eb6378f",
    onSuccess: function (data) {
      let list = [];
      data.map((item) => {
        list.push({
          value: item.emplId,
          label: item.name,
        });
      });
      formState.name = list;
    },
    onFail: function (err) {
      console.log(err);
    },
  });
};

// 删除
const handDel = (record) => {
  Modal.confirm({
    title: "是否删除此条部门?",
    icon: createVNode(ExclamationCircleOutlined),
    okType: "danger",
    okText: "删除",
    cancelText: "取消",
    onOk() {
      return new Promise(async (resolve, reject) => {
        const res = await delUnitDel(record.unitId);
        if (res?.code === 1) {
          message.success("删除成功");
          setTimeout(resolve, 0);
          getUnit();
        }
      }).catch(() => console.log("Oops errors!"));
    },
    onCancel() {},
  });
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
      let counterList = [];
      formState.name.map((item) => {
        if (item?.value) {
          counterList.push({
            counterpartId: item.value,
            counterpartName: item.label,
          });
        } else {
          state.rowEditValue.deUnitCounterpartVos.map((deItem) => {
            if (item === deItem.counterpartId) {
              counterList.push({
                counterpartId: item,
                counterpartName: deItem.counterpartName,
              });
            }
          });
        }
      });

      const data = {
        unitName: formState.depName,
        deUnitCounterpartVos: counterList,
      };
      state.drawerLoading = true;
      if (state.drawerTitle === "编辑") {
        data.unitId = state.rowEditValue.unitId;
        const res = await putUnitUpdate(data);
        if (res?.code === 1) {
          message.success("更新成功");
          getUnit();
          offDrawer();
        }
        state.drawerLoading = false;
      } else {
        if (state.drawerTitle !== "新建一级部门") {
          data.parentUnitId = state.rowEditValue.unitId;
        }
        const res = await postUnitDe(data);
        if (res?.code === 1) {
          message.success("创建成功");
          getUnit();
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

// 获取列表
const getUnit = async () => {
  state.tableLoading = true;
  const res = await getUnitList();
  if (res?.code === 1) {
    state.dataSource = res.data || [];
  }
  state.tableLoading = false;
};

// 初始化
onMounted(() => {
  // getJsapi();
  getUnit();
});
</script>

<style lang="less" scoped>
.maintain {
  padding: 20px;

  .marginBottomLine {
    margin-bottom: 20px;
  }
  // title
  .pageTitle {
    font-size: 24px;
    font-weight: bold;
  }
}
</style>
