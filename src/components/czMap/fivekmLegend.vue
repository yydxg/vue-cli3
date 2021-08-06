<template>
  <div class="fivekmlegend">
    <ul>
      <li v-for="(item, index) in list" :key="index" class="fivekmlegend-item">
        <div
          class="fivekmlegend-item__icon"
          :style="{backgroundColor:item.color,boxShadow:item.color}"
        />
        <p class="fivekmlegend-item__txt">{{ item.name }}</p>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => [1, 2, 3],
    },
  },
};
</script>

<style lang="less" scoped>
.fivekmlegend {
  width: 200px;
  height: 188px;
  border-radius: 1px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  border: 1px solid #76c8e9;
  border-radius: 5px;
  > ul {
    margin-left: 15px;
  }
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
      font-family: MicrosoftYaHei;
      font-size: 24px;
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