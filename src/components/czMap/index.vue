<template>
  <div class="zd-chinaMap">
    <!-- 自定义图例 -->

    <!-- 地图容器 -->
    <div id="mapContainer" class="container" />
    <!-- 首页home按钮 -->
    <div v-show="sceneflag <= -1" class="home" @click="backToDaqu" />
    <div v-show="sceneflag === -1" class="scene-name" @click="gotoAlertShop">
      {{ sceneName }}
    </div>
    <DaquLegend :list="piecesList" />
    <!-- <FiveKmLegend v-show="sceneflag === -2" :list="fivekmList" /> -->
    <!-- 测试功能 -->
    <!-- <TestFun /> -->

    <div class="btns" :class="{ bg: showMenu }">
      <div
        v-show="showMenu"
        :class="{ btns_wrap: showMenu, btns_wrap_hide: !showMenu }"
      >
        <el-switch
          v-model="startWarning"
          active-text="开启预警"
          inactive-text="关闭预警"
          style="margin-bottom: 5px"
          width="50"
          @change="changeWarning"
        >
        </el-switch>
        <!-- <el-switch
          style="display: block; margin-bottom: 5px"
          v-model="startReal"
          active-text="开启仿真"
          inactive-text="关闭仿真"
          width="50"
          @change="changeReal"
        >
        </el-switch> -->
        <el-button
          type="primary"
          icon="el-icon-close"
          circle
          @click="toggleMenu"
        ></el-button>
      </div>
      <el-button
        type="primary"
        icon="el-icon-menu"
        circle
        v-show="!showMenu"
        @click="toggleMenu"
        style="margin-top: 55px"
      ></el-button>
    </div>
  </div>
</template>
<script>
import { ref } from "vue";
// 三维gis
import chinaScene from "./scene/china";
import daquScene from "./scene/daqu";
import tieluReal from "./scene/tieluReal";
import { delayTime, flyToView, latlngToCartesian3 } from "./scene/common";

import DaquLegend from "./daquLegend.vue";
// import FiveKmLegend from "./fivekmLegend.vue";
// import common from '../../common';
import fiveKmScene from "./scene/fivekm";

// const { Lianhua }  = window

export default {
  name: "LianHuaMap",
  components: {
    DaquLegend,
    // FiveKmLegend,
    // TestFun,
  },
  // mixins: [common],
  mixins: [],
  props: {
    locating: {
      type: Object,
      default: () => ({}),
    },
    attr: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const formRef = ref({
      text: "",
      margin: 0,
      size: 100,
      mainColor: "#000",
      subColor: "#fff",
    });
    return {
      form: formRef,
    };
  },
  data() {
    return {
      viewer: null,
      graphicLayer_shop: null,
      sceneName: "", // 场景名称，大区名-省名
      sceneflag: 0, // 标识:中国区 0 ,大区场景 -1，5km -2
      alertShop: {}, // 预警的门店
      alertOk: false, // 是否可接收预警
      lastMoveTime: new Date().getTime(), // 最后一次鼠标在场景中移动时点
      // 控制盈利亏损达成率
      pieces: {
        red: true,
        green: true,
        orange: true,
      },
      piecesList: [
        {
          name: "川藏铁路",
          value: "green",
          color: "rgba(3, 249, 72, 1)",
        },
        {
          name: "其他铁路",
          value: "red",
          color: "rgba(125, 125, 125, 1)",
        },
      ],
      fivekmList: [
        {
          name: "已开拓客户",
          color: "#20D918",
        },
        {
          name: "开拓中客户",
          color: "#D89D01",
        },
        {
          name: "开拓失败客户",
          color: "#F90000",
        },
        {
          name: "未开拓客户",
          color: "#EDEDED",
        },
      ],
      monitorEventHandler: null, // 大区监控

      startWarning: false,
      startReal: false,
      showMenu: false,
    };
  },
  watch: {
    locating: {
      handler() {
        this.resize();
      },
      deep: true,
    },
    alertShop: {
      handler(value) {
        if (value) {
          this.gotoAlertShop(value);
        }
      },
      deep: true,
    },
  },
  beforeUnmount() {
    clearInterval(this.monitorEventHandler);
  },
  mounted() {
    this.$nextTick(() => {
      this.initViewer()
        // .then(async () => {
        //   await delayTime(500);
        //   return this.addMyMapBox();
        // })
        .then(async () => {
          await delayTime(500);
          return this.startAnimation();
        })
        .then(async () => {
          await delayTime(500);
          return this.addChinaBoundary();
        })
        .then(async () => {
          await delayTime(3000);
          this.rendererTielu();
          // this.monitorAlertInterval();
          // this.alertOk = true;
          // return this.bindDaquEvent();
        });
    });
  },
  methods: {
    changeReal(flag){
      if(flag){
        tieluReal.initReal();
      }
    },
    changeWarning(flag) {
      console.log(flag);
      if (flag) {
        this.alertOk = true;
        // 开启预警
        let alertShops = [{
          shopCode: "",
          shopName: "1号点",
          cityName: "西藏",
          longitude: "102.706592",
          latitude: "30.43372",
        },{
          shopCode: "",
          shopName: "2号点",
          cityName: "西藏",
          longitude: "100.443725",
          latitude: "30.002308",
        },{
          shopCode: "",
          shopName: "3号点",
          cityName: "西藏",
          longitude: "96.607888",
          latitude: "29.609193",
        },{
          shopCode: "",
          shopName: "4号点",
          cityName: "西藏",
          longitude: "93.655122",
          latitude: "29.085319",
        },{
          shopCode: "",
          shopName: "5号点",
          cityName: "西藏",
          longitude: "91.29107",
          latitude: "29.777862",
        },{
          shopCode: "",
          shopName: "6号点",
          cityName: "西藏",
          longitude: "100.6368",
          latitude: "31.6148",
        }];
        this.gotoAlertShop(alertShops[parseInt(Math.random()*5)]);
        this.monitorEventHandler = setInterval(() => {
          this.gotoAlertShop(alertShops[parseInt(Math.random()*5)]);
        }, 30000);
      } else {
        // 结束预警
        this.monitorEventHandler && window.clearInterval(this.monitorEventHandler);
      }
    },
    // 配置的接口 返回
    /* interfaceRequestData(data) {
      if (!data) return;
      this.alertShop = JSON.parse(data);
    },
    validateData(data) {
      return JSON.parse(data);
    }, */
    getDataByFixedReq() {
      this.$refs.marqueeIcon.queryNoticeInfo();
      this.$refs.storeLayer.render();
    },
    initViewer() {
      // 初始化三维场景
      return new Promise((resolve) => {
        this.viewer = chinaScene.initViewer("mapContainer");
        resolve();
      });
    },
    addMyMapBox() {
      // 加载mapbox底图
      return new Promise((resolve) => {
        chinaScene.addMyMapBox();
        resolve();
      });
    },
    addChinaBoundary() {
      // 加载中国区边界线
      return new Promise((resolve) => {
        this.viewer && chinaScene.addChinaBoundary();
        resolve();
      });
    },
    startRotate() {
      // 开始旋转
      return new Promise((resolve) => {
        this.viewer && chinaScene.startRotate();
        resolve();
      });
    },
    stopRoate() {
      chinaScene.stopRoate();
    },
    startAnimation() {
      // 开场动画
      return new Promise((resolve) => {
        this.viewer && chinaScene.startAnimation();
        resolve();
      });
    },
    rendererTielu() {
      return new Promise((resolve) => {
        daquScene.rendererTieluLine();
        resolve();
      });
    },
    bindDaquEvent() {
      return new Promise((resolve) => {
        const entities = daquScene.bindDaquEventHandler(this);
        resolve(entities);
      });
    },
    monitorAlertInterval() {
      this.monitorEventHandler = setInterval(() => {
        const now = new Date().getTime();
        if (now - this.lastMoveTime > 5000) {
          this.lastMoveTime = now;
          this.alertOk = true;
        }
      }, 1000);
    },
    focusHomeView() {
      return new Promise((resolve) => {
        this.viewer &&
          flyToView(
            {
              x: -3375557.486508328,
              y: 10515721.580948424,
              z: 5263321.543813613,
            },
            {
              heading: 6.20422043410661,
              pitch: -1.4145093540717504,
              roll: 6.282749257492636,
            },
            4
          );
        resolve();
      });
    },
    backToDaqu() {
      this._backToDaqu(1);
      this.initAletrShop(this.alertShop);
    },
    _backToDaqu(flag) {
      flag === 1 && this.focusHomeView();
      // 非大区场景
      if (this.sceneflag !== 0) {
        this.sceneflag = 0;
        daquScene.destroyDaquSpaceCameraController();
        daquScene.removeDaquMask();
        daquScene.removeFocusShop();
      }
    },
    initAletrShop(value) {
      if (Object.getOwnPropertyNames(value).length === 0) return;
      const { shopName, latitude, longitude, cityName } = value;
      const position = latlngToCartesian3(longitude, latitude, 0);
      daquScene.rendererFocusShop(position, cityName + "-" + shopName, true);
    },
    gotoAlertShop(value) {
      if (!this.viewer || !this.alertOk) {
        return;
      }
      let count = 1; // 计数
      const { shopCode, shopName, cityName, latitude, longitude } =
        value;
      const position = latlngToCartesian3(longitude, latitude, 0);
      this._backToDaqu(1);
      const blingHandle = setInterval(() => {
        count += 1;
        if (count % 2 === 0) {
          daquScene.removeFocusShop();
        } else if (count % 2 === 1) {
          daquScene.rendererFocusShop(
            position,
            cityName + "-" + shopName,
            true
          );
        }
        if (count > 10) {
          clearInterval(blingHandle);
          this.sceneflag = -2;
          daquScene.removeDaquShopMarker();
          fiveKmScene.removeFivekm();
          daquScene.removeFocusShop();
          daquScene.controlDaquSpaceCameraController();
          daquScene.rendererFocusShop(position, shopName, false);
          fiveKmScene.rendererFivekm(shopCode, position);

          const backEvent = setTimeout(() => {
            clearTimeout(backEvent);
            if (!this.alertOk) return;
            this.startAnimation().then(() => {
              this._backToDaqu(0);
              daquScene.removeFocusShop();
              daquScene.rendererFocusShop(position, shopName, true);
            });
          }, 10000);
        }
      }, 1000);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
  },
};
</script>
<style lang="less" scoped>
.zd-chinaMap {
  height: 100%;
  position: relative;

  .legend {
    position: absolute;
    bottom: 0px;
    left: 0px;
    z-index: 9999;
    border-radius: 4px;
    border: 1px solid rgba(128, 128, 128, 0.5);
    color: #ffffff;
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 3px 14px rgb(128 128 128 / 50%);
  }

  .fivekmlegend {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 9999;
  }

  .container {
    height: 100%;
    background-image: url("./assets/bg.png");
    background-size: 100% 100%;
  }
}

.home {
  position: fixed;
  top: -60px;
  left: 10px;
  cursor: pointer;
  width: 60px;
  height: 60px;
  background-image: url("./assets/home.png");
  background-size: 100% 100%;
}

.scene-name {
  position: fixed;
  top: 30px;
  left: 15px;
  height: 36px;
  font-family: MicrosoftYaHei-Bold;
  font-size: 36px;
  color: #fff;
  line-height: 36px;
  font-weight: 700;
}

.pop-baiduMap {
  width: 100%;
  height: 100%;
}

.pop-summary {
  position: absolute;
  top: 42px;
  left: -1px;
}

.info-warpper {
  background-color: red;
}
.store-layer {
  position: absolute;
  top: 4px;
  left: 10px;
  z-index: 9;
}

.marquee-layer {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translate(-50%);
  z-index: 9;
  font-size: 20px;
  color: #ffffff;
  font-weight: 700;
  width: 1006px;
  height: 62px;
  border: 1px solid #416d8e;
  background-color: rgba(12, 16, 30, 0.8);
}

:deep(.alertShopLabel) {
  padding: 0 5px;
  height: 42px;
  background: #b33523;
  color: #ffffff;
  font-size: 20px;
  font-weight: 400;
  font-family: MicrosoftYaHei;
  opacity: 0.84;
  border: 2px solid #fc4d34;
  border-radius: 6px;
  text-align: center;
  line-height: 42px;
  margin-bottom: 70px;
}

:deep(.mars3d-div-graphic) {
  z-index: 99;
}

:deep(.daqu-info) {
  border: 1px skyblue solid;
  width: 275px;
  height: 150px;
  position: relative;
  border-radius: 5px;
  background-color: rgba(21, 18, 18, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

:deep(.daqu-info::before) {
  content: "";
  width: 0;
  height: 0;
  position: absolute;
  top: 149px;
  left: 115px;
  border-bottom: 0px solid transparent;
  border-top: 22px solid skyblue;
  border-left: 22px solid transparent;
  border-right: 22px solid transparent;
}

:deep(.daqu-info::after) {
  content: "";
  width: 0;
  height: 0;
  position: absolute;
  top: 148px;
  left: 115px;
  border-bottom: 0px solid transparent;
  border-top: 22px solid rgba(2, 2, 2, 0.86);
  border-left: 22px solid transparent;
  border-right: 22px solid transparent;
}

:deep(.daqu-info .face img) {
  width: 80px;
  height: 80px;
}

:deep(.daqu-info .incharge) {
  width: 170px;
  cursor: pointer;
}

:deep(.daqu-info .incharge .daquname) {
  font-size: 28px;
  color: #ffffff;
  font-weight: 700;
  font-family: MicrosoftYaHei-Bold;
}

:deep(.daqu-info .incharge .username) {
  font-family: MicrosoftYaHei;
  font-size: 20px;
  color: #dbdada;
  font-weight: 400;
  margin-top: 20px;
}

:deep(.daqu-info .incharge .daquname .arrow) {
  position: fixed;
  width: 20px;
  height: 20px;
  right: 20px;
  top: 43px;
  border-right: 2px solid #fff;
  border-top: 2px solid #fff;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  /*不加这两个属性三角会比上一个略丑, 大家可以试一下*/
  border-left: 2px solid transparent;
  border-bottom: 2px solid transparent;
}

:deep(.kehu-info) {
  border: 1px skyblue solid;
  width: 550px;
  height: 450px;
  position: relative;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.7);
}

:deep(.kehu-info::before) {
  box-sizing: content-box;
  width: 0px;
  height: 0px;
  position: absolute;
  top: 447px;
  left: 242px;
  padding: 0;
  border-bottom: 22px solid transparent;
  border-top: 22px solid rgba(0, 0, 0, 0.8);
  border-left: 22px solid transparent;
  border-right: 22px solid transparent;
  display: block;
  content: "";
  z-index: 12;
}

:deep(.kehu-info::after) {
  box-sizing: content-box;
  width: 0px;
  height: 0px;
  position: absolute;
  top: 448px;
  left: 241px;
  padding: 0;
  border-bottom: 23px solid transparent;
  border-top: 23px solid skyblue;
  border-left: 23px solid transparent;
  border-right: 23px solid transparent;
  display: block;
  content: "";
  z-index: 11;
}
:deep(.kehu-info .title) {
  width: 100%;
  height: 66px;
  background: rgba(168, 191, 204, 0.18);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
:deep(.kehu-info .title .name) {
  font-family: MicrosoftYaHei-Bold;
  font-size: 30px;
  color: #ffffff;
  line-height: 30px;
  font-weight: 700;
}
:deep(.kehu-info .title .unit) {
  font-family: MicrosoftYaHei;
  font-size: 18px;
  color: #ffffff;
  line-height: 24px;
  font-weight: 400;
}

:deep(.kehu-info .board .first) {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 20px;
}
:deep(.kehu-info .board .first .item .num) {
  font-family: ChildishAL;
  font-size: 30px;
  color: #ffffff;
  text-align: center;
  line-height: 30px;
  font-weight: 400;
  margin-bottom: 10px;
}
:deep(.kehu-info .board .first .item .subject) {
  font-family: MicrosoftYaHei;
  font-size: 20px;
  color: #ccc;
  line-height: 20px;
  font-weight: 400;
}
:deep(.kehu-info .board .second) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0 20px;

  font-family: MicrosoftYaHei-Bold;
  font-size: 20px;
  color: #ffffff;
  font-weight: 700;
}

:deep(.kehu-info .board .third) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-top: 20px;
  padding-left: 20px;
}

:deep(.kehu-info .board .third .item) {
  width: 33%;
  margin-bottom: 15px;
}
:deep(.kehu-info .board .third .item:nth-child(3n + 3)) {
  width: 34%;
}
:deep(.kehu-info .board .third .item img) {
  vertical-align: middle;
}
:deep(.kehu-info .board .third .item .subject) {
  font-family: MicrosoftYaHei;
  font-size: 20px;
  color: #ccc;
  line-height: 20px;
  font-weight: 400;
  margin-left: 14px;
  vertical-align: middle;
}

.btns {
  position: fixed;
  bottom: 0;
  z-index: 99999;
  width: 220px;
  height: 100px;
  left: 50%;
  margin-left: -110px;
  .btns_wrap {
    display: block;
    padding: 8px;
    background: #282121;
    margin: 10px;
  }
  .btns_wrap_hide {
    display: none;
  }
}
.bg {
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.5);
  color: #ffffff;
  background: rgba(0, 0, 0, 0.4);
}
:deep(.el-switch__label) {
  color: #ffffff;
}
:deep(.el-switch__label.is-active) {
  color: #409eff;
}
</style>
