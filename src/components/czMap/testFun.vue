<template>
  <div class="testbox">
    <div class="test">
      <a @click="startNew">重新开始</a>
      <a @click="startRotate">开启旋转</a>
      <a @click="stopRotate">结束旋转</a>
      <a @click="startAnimation">开场动画</a>
      <a @click="rendererDaqu">渲染大区</a>
      <a @click="bindDaquEventHandler">绑定大区事件</a>
      <a @click="unbindDaquEventHandler">解绑大区事件</a>
      <a @click="rendererFivekm">下钻通州</a>
    </div>
  </div>
</template>
<script>
import { delayTime, UniqueNameMap } from './scene/common';

import chinaScene from './scene/china';
import daquScene from './scene/daqu';
import fiveKmScene from './scene/fivekm';

/*eslint-disable*/
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
  methods: {
    startRotate() {
      viewer.camera.flyTo({
        destination: { x: -3437671.00419104, y: 16322637.59488227, z: 7992906.952750628 },
        orientation: {
          heading: 5.745247309138634,
          pitch: -1.5677923398541922,
          roll: 0,
        },
        complete: () => {
          setTimeout(() => {
          }, 2000);
        },
      });

      this.$parent.startRotate();
    },
    stopRotate() {
      chinaScene.stopRotate();
    },
    startAnimation() {
      this.$parent.startAnimation();
    },
    rendererDaqu() {
      this.$parent.rendererDaqu();
    },
    bindDaquEventHandler() {
      daquScene.bindDaquEventHandler();
    },
    unbindDaquEventHandler() {
      daquScene.unbindDaquEventHandler();
    },
    rendererFivekm() {
      const daqu_polygon_datasource = viewer.dataSources.getByName(UniqueNameMap.daqu_polygon)[0];
      daqu_polygon_datasource.entities.removeAll();
      const daqu_polygon_hightlight_datasource = viewer.dataSources.getByName(UniqueNameMap.daqu_polygon_hightlight)[0];
      daqu_polygon_hightlight_datasource.entities.removeAll();
      Lianhua.graphicLayer_daqu_shop_marker.clear();
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(116.45, 39.86, 20000.0),
      });
      fiveKmScene.rendererFivekm();
    },
    startNew: async () => {
      chinaScene.startAnimation();
      // chinaScene.addChinaBoundary();
      daquScene.rendererDaqu();
      daquScene.bindDaquEventHandler();
      await delayTime(4000);
      viewer.camera.flyTo({
        destination: { x: -3133510.6223258968, y: 7335556.1306613125, z: 2541668.7937529194 },
        orientation: {
          heading: 6.148143891829902,
          pitch: -1.106129084805704,
          roll: 0.00015066130642704678,
        },
        complete: () => {
          setTimeout(() => {
          }, 2000);
        },
      });
    },

  },
};
</script>
<style lang="less" scoped>
.testbox {
  height: 30px;
  .test {
    position: relative;
    height: 100px;
    width: 30%;
    float: right;
    z-index: 111;
    bottom: 100px;
    display: none;

    > a {
      color: skyblue;
      cursor: pointer;
    }
  }
  &:hover .test {
    display: block;
  }
}
</style>
