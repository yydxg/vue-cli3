/*eslint-disable*/

import { URL, UniqueNameMap, setCursor } from './common';

// 记录旋转当前场景时钟
let previousTime = 0;

export default {
  // 初始化地图场景，入口
  initViewer(mapDom) {
    const map3d = new mars3d.Map(mapDom, {
      scene: {
        center: {
          // lat: 36, lng: 107, alt: 6000000, heading: 0, pitch: -75,
          alt: 5860096, heading: 355, lat: 25.558852, lng: 107.796684, pitch: -81,
        },
        orderIndependentTranslucency: false,
        contextOptions: { webgl: { alpha: true } }, // 允许透明
        showSun: false,
        showMoon: false,
        showSkyBox: false,
        showSkyAtmosphere: false, // 关闭球周边的白色轮廓 map3d.scene.skyAtmosphere = false
        fog: false,
        globe: {
          showGroundAtmosphere: false, // 关闭大气（球表面白蒙蒙的效果）
          depthTestAgainstTerrain: false,
          baseColor: 'rgba(0,0,0,0)',
        },
        cameraController: {
          zoomFactor: 3.0,
          minimumZoomDistance: 1,
          maximumZoomDistance: 50000000,
          enableRotate: true,
          enableZoom: true,
        },
      },
      control: {
        baseLayerPicker: false, // basemaps底图切换按钮
        homeButton: false, // 视角复位按钮
        sceneModePicker: false, // 二三维切换按钮
        navigationHelpButton: false, // 帮助按钮
        fullscreenButton: false, // 全屏按钮
        defaultContextMenu: true, // 右键菜单
      },
      terrain: {
        url: '//data.marsgis.cn/terrain',
        show: true,
      },
      basemaps: [
        {
          name: '天地图影像',
          icon: 'img/basemaps/tdt_img.png',
          type: 'tdt',
          layer: 'img_d',
          key: ['9ae78c51a0a28f06444d541148496e36'],
          show: true,
        },
      ],
    });
    map3d.clock.multiplier = 300; // 旋转速度
    // map3d.basemap = 2017 // 内置底图
    // cesium对应的原始地球对象
    const { viewer } = map3d;
    window.map = map3d
    // 去掉entity的点击事件 start
    map3d.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    map3d.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 添加实体容器
    viewer.dataSources.add(new Cesium.CustomDataSource(UniqueNameMap.daqu_polygon));
    viewer.dataSources.add(new Cesium.CustomDataSource(UniqueNameMap.daqu_line));
    viewer.dataSources.add(new Cesium.CustomDataSource(UniqueNameMap.tielu_line));
    // viewer.dataSources.add(new Cesium.CustomDataSource(UniqueNameMap.daqu_polygon_hightlight));

    // 创建DIV数据图层
    const graphicLayer_daqu_sheng_marker = new mars3d.layer.DivLayer({ name: UniqueNameMap.daqu_sheng_marker });
    const graphicLayer_daqu_sheng_dialog = new mars3d.layer.DivLayer({ name: UniqueNameMap.daqu_sheng_dialog });
    // 注意：只有加了监听事件的，才能监听到内部的点击事件
    graphicLayer_daqu_sheng_dialog.on(mars3d.EventType.click, (event) => { });
    const graphicLayer_daqu_shop_marker = new mars3d.layer.DivLayer({ name: UniqueNameMap.daqu_shop_marker });
    graphicLayer_daqu_shop_marker.on(mars3d.EventType.click, (event) => { });
    const graphicLayer_daqu_shop_focus_marker = new mars3d.layer.DivLayer({ name: UniqueNameMap.daqu_shop_focus_marker });
    const graphicLayer_five_shop_marker = new mars3d.layer.DivLayer({ name: UniqueNameMap.five_shop_marker });
    const graphicLayer_five_shop_dialog = new mars3d.layer.DivLayer({ name: UniqueNameMap.five_shop_dialog });
    graphicLayer_five_shop_dialog.on(mars3d.EventType.click, (event) => { });
    graphicLayer_daqu_shop_focus_marker.on(mars3d.EventType.click, (event) => { });

    map3d.addLayer(graphicLayer_daqu_sheng_marker);
    map3d.addLayer(graphicLayer_daqu_shop_focus_marker);
    map3d.addLayer(graphicLayer_daqu_shop_marker);
    map3d.addLayer(graphicLayer_daqu_sheng_dialog);
    map3d.addLayer(graphicLayer_five_shop_marker);
    map3d.addLayer(graphicLayer_five_shop_dialog);

    window.Lianhua = {
      vueHandler: null,
      graphicLayer_daqu_sheng_marker,
      graphicLayer_daqu_sheng_dialog,
      graphicLayer_daqu_shop_marker,
      graphicLayer_daqu_shop_focus_marker,
      graphicLayer_five_shop_marker,
      graphicLayer_five_shop_dialog,
    };
    window.map3d = map3d;
    window.viewer = viewer;
    return viewer;
  },
  addMyMapBox() {
    if (!viewer) return;
    const layer = new Cesium.MapboxStyleImageryProvider({
      // 可提取
      url: 'https://api.mapbox.com/styles/v1',
      username: 'zhengyuan01',
      styleId: 'ckpxsxotm19fl17qqkoe9h6ty',
      accessToken: 'pk.eyJ1Ijoiemhlbmd5dWFuMDEiLCJhIjoiY2tweHJuaWMyMDd4aDJ2cGR4azJpMHA3ZyJ9.2uE3aEVVqriGOKNU11xEnw',
      // username: 'cherwx',
      // styleId: 'ckpdm6rra0kd917pj1qx3b1ej',
      // accessToken: 'pk.eyJ1IjoiY2hlcnd4IiwiYSI6ImNrcGRnZnZzbzBpM2Eyd3JvdnB2NTgwZncifQ.2gkKr867BSUfMhrEmZtNjA',
      scaleFactor: true,
    });
    viewer.imageryLayers.addImageryProvider(layer);
  },
  // 加载网格layer，测试专用
  addGridLayer() {
    const gridImagery = new Cesium.GridImageryProvider();
    const gridImageryLayer = viewer.imageryLayers.addImageryProvider(gridImagery);
  },
  // 加载中国大区的边界线
  addChinaBoundary() {
    if (!viewer) return;
    const promise_lingstring = Cesium.GeoJsonDataSource.load(URL.chinaBoundary);
    promise_lingstring.then((data) => {
      viewer.dataSources.add(data);
      const entities = data.entities.values;
      entities.forEach((entity) => {
        entity.polyline.width = 3;
        entity.polyline.material = Cesium.Color.fromCssColorString('#10B2D0').withAlpha(0.9);
      });
    });
  },
  // 三维球tick旋转
  map_onClockTick(clock) {
    const spinRate = 1;
    const currentTime = map3d.clock.currentTime.secondsOfDay;
    const delta = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    map3d.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  },
  // 三维球开始旋转
  startRotate() {
    if (!map3d) return;
    this.stopRotate();
    previousTime = map3d.clock.currentTime.secondsOfDay;
    map3d.on(mars3d.EventType.clockTick, this.map_onClockTick);
  },
  // 三维球结束旋转
  stopRotate() {
    if (!map3d) return;
    map3d.off(mars3d.EventType.clockTick, this.map_onClockTick);
  },
  startAnimation() {
    if (!map3d) return;
    map3d.flyHome({ duration: 0 });
    // 开场动画
    map3d.openFlyAnimation({
      duration1: 3,
      // easingFunction1: Cesium.EasingFunction,
      callback() {
        // 动画播放完成后回调
      },
    });
  },
  // 加载效果点
};