<template>
  <a-col  :lg="6" :xs="24">
    <a-row align="middle" >
      <a-divider
        type="vertical"
        class="dividerLine"
      />
      <div class="rightBox">
        <div class="itemTitle">{{ props.title }}</div>
     <div class="itemNum">¥{{ props.numValue !== ' - '? numEidt(props.numValue) :' - ' }}</div>
      </div>
    </a-row>
  </a-col>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  numValue: {
    type: Number,
    default: 0,
  },
});
const numEidt = (value) =>{
  let text = ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return  text
}
</script>

<style lang="less" scoped>
.dividerLine{
height: 60px;
 background-color: #4395ff
}
.rightBox{
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  .itemTitle{
    color: gray;
    font-size:16px;
    padding-bottom: 6px;
  }
  .itemNum{
    font-size:22px;
  }
}

</style>