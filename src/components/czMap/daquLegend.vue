<template>
  <div class="legend bg">
    <div class="inner">
    <template :key="index" v-for="(item, index) in list">
      <label class="inner-item" :style="{color:item.color}">
        <div class="inner-item__icon" :style="{backgroundColor:item.color,boxShadow:item.color}" />
        <p class="inner-item__txt">{{ item.name }}</p>
      </label>
    </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    models: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>
<style lang="less" scoped>
.inner {
  margin: 8px;
  background: #282121;
  padding: 0 10px;

  &-item {
    margin-top: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &__icon {
      width: 12px;
      height: 12px;
      border-radius: 100%;
      margin-right: 5px;
      box-shadow: 0 0 5px;
    }
    &__txt {
      flex: 1;
      font-size: 20px;
      margin-left: 10px;
    }
    &__check {
      @color: rgba(0, 126, 255, 1);
      width: 12px;
      height: 12px;
      color: @color;
      border: 1px solid @color;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    &__field > input {
      appearance: none;
    }
  }
}
</style>
