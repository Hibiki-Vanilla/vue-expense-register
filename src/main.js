if (typeof window.global === 'undefined') {
    window.global = window;
}
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";
// 局部导入组件
import {
    Button,
    Spin,
    Result,
    List,
    Table,
    Menu,
    Popconfirm,
    Divider,
    Form,
    Input,
    Card,
    Tree,
    Modal,
    Radio,
    Row,
    Affix,
    Col,
    Select,
    Tabs,
    Space,
    Descriptions,
    Drawer,
    DatePicker,
    InputNumber,
    ConfigProvider
} from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
const app = createApp(App);

app.use(router)

app.use(ConfigProvider)
app.use(Descriptions)
app.use(DatePicker)
app.use(Tabs)
app.use(Affix)
app.use(Radio)
app.use(Row)
app.use(Col)
app.use(Button)
app.use(Drawer)
app.use(Card)
app.use(Select)
app.use(Menu)
app.use(Input)
app.use(Form)
app.use(InputNumber)
app.use(Table)
app.use(Space)
app.use(Tree)

app.use(Popconfirm)
app.use(Spin)
app.use(Modal)
app.use(Result)
app.use(List)
app.use(Divider)


app.mount('#app')
