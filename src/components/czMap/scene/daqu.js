import { getLotusChinaMap, getLotusRegionMap } from '../../../apis/zd';
import {
  UniqueNameMap, URL, setCursor, flyToView, delayTime, cartesian3ToLatlng, latlngToCartesian3,
} from './common';
import fiveKmScene from './fivekm';

// let { viewer, Lianhua ,mars3d } = window
let handler = null;
let daquGeoJsonLayer = null;

const controlDaquSpaceCameraController = () => {
  viewer.scene.screenSpaceCameraController.enableTranslate = false;
  // viewer.scene.screenSpaceCameraController.enableRotate = false;
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100000;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1500000;
};

const destroyDaquSpaceCameraController = () => {
  viewer.scene.screenSpaceCameraController.enableTranslate = true;
  // viewer.scene.screenSpaceCameraController.enableRotate = true;
  viewer.scene.screenSpaceCameraController.enableTilt = true;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50000000;
};

const addShengDialog = (position, info) => {
  Lianhua.graphicLayer_daqu_sheng_dialog.clear();
  const graphic = new mars3d.graphic.DivGraphic({
    position,
    style: {
      offsetY: -100,
      pixelOffsetY: 5000,
      /* eslint-disable */
      html: `<div class="daqu-info">
              <div class="face"><img src= ${require(`../assets/svc/${info.TOUXIANG}`)} /></div>
              <div class="incharge" onclick='gotoDaquScene("${info.proCode}")'>
                <div class="daquname">${info.QUNAME}<div class='arrow'></div></div>
                <div class="username">${info.SVCNAME}</div>
              </div>
            </div>`,
      /* eslint-disable-end*/
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1000000, 7000000), // 按视距距离显示
    },
  });
  Lianhua.graphicLayer_daqu_sheng_dialog.addGraphic(graphic);
};

function removeShengDialog() {
  Lianhua.graphicLayer_daqu_sheng_dialog.clear();
}

function rendererDaquShopMarker(proCode, callback) {
  getLotusRegionMap(proCode).then((res, index) => {
    const { mapData, lossTop5 } = res[0];
    Lianhua.graphicLayer_daqu_shop_marker.clear();
    mapData && mapData.forEach((item) => {
      const {
        cityNm, shopCode, shopName, longitude, latitude, colorFlag
      } = item;
      const graphic = new mars3d.graphic.BillboardEntity({
        name: UniqueNameMap.daqu_shop_marker,
        position: [longitude, latitude],
        attr: {
          cityNm,
          proCode,
          shopCode,
          shopName,
        },
        style: { // '1' 盈利  '-1' 盈亏
          image: colorFlag === '1' ? URL.daqu_marker_profit : URL.daqu_marker_loss,
          scale: 1,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(600000, 1.0, 2500000, 0),
          label: {
            text: shopName,
            font_size: 16,
            color: '#ffffff',
            pixelOffsetY: -50,
            distanceDisplayCondition: true,
            distanceDisplayCondition_far: 80000,
            distanceDisplayCondition_near: 0,
          },
        },
      });
      graphic.on(mars3d.EventType.click, callback);
      Lianhua.graphicLayer_daqu_shop_marker.addGraphic(graphic);
    });

    // 倒数五名
    lossTop5 && lossTop5.forEach((item) => {
      const {
        cityNm, shopCode, shopName, longitude, latitude, colorFlag,
      } = item;
      const graphic = new mars3d.graphic.BillboardEntity({
        name: UniqueNameMap.daqu_shop_marker,
        position: [longitude, latitude],
        attr: {
          cityNm,
          proCode,
          shopCode,
          shopName,
        },
        style: {
          image: colorFlag === '1' ? URL.daqu_marker_profit : URL.daqu_marker_loss,
          scale: 1,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scaleByDistance: new Cesium.NearFarScalar(600000, 1.0, 2500000, 0),
          label: {
            text: shopName,
            font_size: 20,
            font_family: 'MicrosoftYaHei',
            font_weight: 'Bold',
            color: '#ffffff',
            pixelOffsetY: -60,
            distanceDisplayCondition: true,
            distanceDisplayCondition_far: 800000,
            distanceDisplayCondition_near: 70000,
          },
        },
      });
      graphic.on(mars3d.EventType.click, callback);
      Lianhua.graphicLayer_daqu_shop_marker.addGraphic(graphic);
    });
  });
}

const removeDaquShopMarker = () => {
  Lianhua.graphicLayer_daqu_shop_marker.clear();
};

// 渲染大区图形
const rendererDaqu = () => {
  if (!viewer) return;
  getLotusChinaMap().then((res) => {
    const { mapData } = res[0];
    const promise_daqu_polygon = Cesium.GeoJsonDataSource.load(URL.daqu_polygon);
    promise_daqu_polygon.then((data) => {
      const daqu_polygon_datasource = viewer.dataSources.getByName(UniqueNameMap.daqu_polygon)[0];
      daqu_polygon_datasource && daqu_polygon_datasource.entities.removeAll();
      const entities = data.entities.values;
      entities.forEach((entity) => {
        const { COLOR, proCode } = entity.properties;
        const item = mapData.find((item) => item.proCode === proCode._value);

        entity.colorFlag = item.colorFlag;
        entity.name = UniqueNameMap.daqu_polygon;
        entity.polygon.arcType = Cesium.ArcType.GEODESIC;
        entity.polygon.outline = false;
        entity.polygon.material = (item.colorFlag < 0) ? Cesium.Color.fromCssColorString('#6A3838').withAlpha(1) : Cesium.Color.fromCssColorString('#488A96').withAlpha(1);
        // entity.polygon.material = (Math.random() > 0.5) ? Cesium.Color.fromCssColorString('#6A3838').withAlpha(1) : Cesium.Color.fromCssColorString('#488A96').withAlpha(1);
        // entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(800000, 10000000)
        daqu_polygon_datasource && daqu_polygon_datasource.entities.add(entity);
      });
    });
  });
};

const removeDaqu = () => {
  const daqu_polygon_datasource = viewer.dataSources.getByName(UniqueNameMap.daqu_polygon)[0];
  daqu_polygon_datasource && daqu_polygon_datasource.entities.removeAll();
};

const rendererDaquLine = () => {
  if (!viewer) return;
  const promise_daqu_line = Cesium.GeoJsonDataSource.load(URL.daqu_line);
  promise_daqu_line.then((data) => {
    const daqu_line_datasource = viewer.dataSources.getByName(UniqueNameMap.daqu_line)[0];
    daqu_line_datasource && daqu_line_datasource.entities.removeAll();
    const entities = data.entities.values;
    entities.forEach((entity) => {
      const { COLOR } = entity.properties;
      entity.name = UniqueNameMap.daqu_line;
      entity.polyline.arcType = Cesium.ArcType.GEODESIC; // RHUMB 直线
      entity.polyline.width = 2;
      entity.polyline.material = Cesium.Color.fromCssColorString(COLOR._value).withAlpha(1);
      entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 10000000);
      daqu_line_datasource && daqu_line_datasource.entities.add(entity);
    });
    // return entities;
  });
};

const rendererTieluLine = () => {
  if (!viewer) return;
  const promise_tielu_line = Cesium.GeoJsonDataSource.load(URL.tielu_line);
  promise_tielu_line.then((data) => {
    const tielu_line_datasource = viewer.dataSources.getByName(UniqueNameMap.tielu_line)[0];
    tielu_line_datasource && tielu_line_datasource.entities.removeAll();
    const entities = data.entities.values;
    entities.forEach((entity) => {
      const { COLOR } = entity.properties;
      entity.name = UniqueNameMap.tielu_line;
      entity.polyline.arcType = Cesium.ArcType.GEODESIC;
      entity.polyline.width = 2;
      let color = '#797676';
      if(COLOR) {
        color = COLOR._value
      }
      entity.polyline.material = Cesium.Color.fromCssColorString(color).withAlpha(1);
      entity.polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(0, 10000000);
      tielu_line_datasource && tielu_line_datasource.entities.add(entity);
    });
  });
};

// 渲染大区省marker
const rendererDaquShengMarker = () => {
  getLotusChinaMap().then((res) => {
    Lianhua.graphicLayer_daqu_sheng_marker.clear();
    const { mapData } = res[0];
    mapData.forEach((item) => {
      const { provLatitude, provLongitude, colorFlag } = item;
      const jd = Number(provLongitude);
      const wd = Number(provLatitude);
      const graphic = new mars3d.graphic.DivGraphic({
        position: Cesium.Cartesian3.fromDegrees(jd, wd),
        style: {
          circle: 10,
          html: `<div class="mars3d-animation-point" style="color:${Number(colorFlag) < 0 ? '#FF371C' : '#00F948'};"><p></p></div>`,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1000000, 10000000), // 按视距距离显示
        },
      });
      Lianhua.graphicLayer_daqu_sheng_marker.addGraphic(graphic);
    });
  });
};

const removeDaquShengMarker = () => {
  Lianhua.graphicLayer_daqu_sheng_marker.clear();
};

// 大区事件
const bindDaquEventHandler = (vueHandler, callback) => {
  Lianhua.vueHandler = vueHandler;
  if (!viewer) return;
  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  // 鼠标hover
  handler.setInputAction((movement) => {
    // 设置不接受预警操作
    Lianhua.vueHandler.lastMoveTime = new Date().getTime();
    Lianhua.vueHandler.alertOk = false;

    setCursor('pointer');
    const pickedModel = viewer.scene.pick(movement.endPosition);
    const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);

    if (Cesium.defined(pickedModel) && pickedModel.id && pickedModel.id.name === UniqueNameMap.daqu_polygon) {
      const entity = pickedModel.id;
      const {
        LONGITUDE, LATITUDE, SVCNAME, TOUXIANG, QUNAME, NAME, proCode,
      } = entity.properties;

      /* const newEntity = new Cesium.Entity({
        id: UniqueNameMap.daqu_polygon_hightlight,
        name: UniqueNameMap.daqu_polygon_hightlight,
        polygon: entity.polygon,
      });
      // newEntity.polygon.material = entity.polygon.material.color._value.withAlpha(0.5)
      newEntity.polygon.outlineWidth = 4;
      newEntity.polygon.material = Number(entity.colorFlag) > 0 ? Cesium.Color.fromCssColorString('#096777').withAlpha(0.7) : Cesium.Color.fromCssColorString('#6A3838').withAlpha(0.6);
      newEntity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(10000, 10000000);

      const daqu_polygon_hightlight_datasource = viewer.dataSources.getByName(UniqueNameMap.daqu_polygon_hightlight)[0];
      const oldEntity = daqu_polygon_hightlight_datasource.entities.getById(UniqueNameMap.daqu_polygon_hightlight);
      viewer.dataSources.lowerToBottom(daqu_polygon_hightlight_datasource);
      daqu_polygon_hightlight_datasource.entities.remove(oldEntity);
      daqu_polygon_hightlight_datasource.entities.add(newEntity); */

      addShengDialog(cartesian, {
        SVCNAME, TOUXIANG, QUNAME, proCode, vueHandler,
      });
    } else {
      Lianhua.graphicLayer_daqu_sheng_dialog.clear();
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // 鼠标点击事件
  handler.setInputAction((click) => {
    const pickedModel = viewer.scene.pick(click.position);
    const cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);

    if (Cesium.defined(pickedModel) && pickedModel.id && pickedModel.id.name === UniqueNameMap.daqu_polygon) {
      const entity = pickedModel.id;
      const {
        LONGITUDE, LATITUDE, SVCNAME, TOUXIANG, QUNAME, NAME, proCode,
      } = entity.properties;

      gotoDaquScene(proCode._value);
    }

    if (Cesium.defined(cartesian)) {
      const {
        longitude,
        latitude,
        height,
      } = Cesium.Cartographic.fromCartesian(cartesian);
      const clickRadians = radToDegree({
        longitude,
        latitude,
        height,
      }, ['longitude', 'latitude']);

      // console.log('点击-orientation', `"heading":${viewer.camera.heading},"pitch":${viewer.camera.pitch},"roll":${viewer.camera.roll}`);
      // console.log('点击-destination', `"x":${viewer.camera.position.x},"y":${viewer.camera.position.y},"z":${viewer.camera.position.z}`);
      console.log('点击-地理坐标', clickRadians.longitude, clickRadians.latitude, clickRadians.height);
      callback && callback([clickRadians.longitude, clickRadians.latitude, clickRadians.height]);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 将弧度转化为角度obj{a:1,b:1,c:1}
  function radToDegree(obj, items = [], precision) {
    const canFixed = typeof precision === 'number' && precision >= 0 && precision <= 100;
    if (typeof obj === 'number') {
      return canFixed ? Cesium.Math.toDegrees(obj).toFixed(precision) : Cesium.Math.toDegrees(obj);
    }
    for (const key in obj) {
      obj[key] = items.indexOf(key) > -1 ? (canFixed ? Cesium.Math.toDegrees(obj[key]).toFixed(precision) : Cesium.Math.toDegrees(obj[key])) : obj[key];
    }
    return obj;
  }
};

const clickLightDaqu = (value) => {
  // 关联点击大区
  const param = {
    id: Lianhua.vueHandler.locating.id,
    name: 'regionName',
    value,
  };
  // 更新本地
  Lianhua.vueHandler.store.updateGlobalFilterArgs(
    param,
  );
  if (Lianhua.vueHandler.editable) {
    // 更新全局
    Lianhua.vueHandler.$store.commit('editor/updateGlobalFilterArgs', param);
  }
}

const unbindDaquEventHandler = () => {
  if (handler) {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
};

async function gotoDaquScene(proCode) {
  Lianhua.vueHandler.sceneflag = -1;
  const item = URL.daqu_polygon.features.find((f) => f.properties.proCode === proCode);
  const {
    properties: {
      destination, orientation, QUNAME, NAME,
    },
  } = item;
  Lianhua.vueHandler.sceneName = `${QUNAME}-${NAME}`;

  clickLightDaqu(QUNAME)

  // 移除大区
  removeDaqu();
  // 移除大区svc弹框
  removeShengDialog();
  //添加遮罩
  removeDaquMask();
  removeFocusShop();
  addDaquMask(item);
  viewer && flyToView(destination, orientation);
  await delayTime(2000);

  controlDaquSpaceCameraController();
  rendererDaquShopMarker(proCode, (event) => {
    // 渲染五公里
    const { attr, point: { lng, lat }, position } = event.graphic;
    Lianhua.vueHandler.sceneflag = -2;
    Lianhua.vueHandler.shopAttr = attr;
    // 替换门店icon
    removeDaquShopMarker();
    removeFocusShop();
    rendererFocusShop(position, attr.shopName, false);
    fiveKmScene.rendererFivekm(attr.shopCode, position);
  });
}
window.gotoDaquScene = gotoDaquScene;

const addDaquMask = (data) => {
  daquGeoJsonLayer = new mars3d.layer.GeoJsonLayer({
    data: data,
    mask: true, //标识为遮罩层【重点参数】
    symbol: {
      styleOptions: {
        fill: true,
        color: 'rgb(0,0,0)',
        opacity: 0.5,
        outline: false,
        outlineColor: '#39E09B',
        outlineWidth: 2,
        outlineOpacity: 0.5,
        arcType: Cesium.ArcType.GEODESIC,
        clampToGround: true,
      },
    },
  })
  map3d && map3d.addLayer(daquGeoJsonLayer);
}

const removeDaquMask = () => {
  daquGeoJsonLayer && map3d && map3d.removeLayer(daquGeoJsonLayer);
}

const rendererFocusShop = (position, shopName, hasAlertLabel) => {
  const newGraphic = new mars3d.graphic.BillboardEntity({
    name: UniqueNameMap.daqu_shop_focus_marker,
    position,
    style: {
      image: URL.daqu_marker_default,
      scale: 1,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      // scaleByDistance: new Cesium.NearFarScalar(600000, 1.0, 1000000, 1.0),
      distanceDisplayCondition: true,
      distanceDisplayCondition_far: 10000000,
      distanceDisplayCondition_near: 0,
      label: {
        text: shopName,
        font_size: 24,
        color: '#ffffff',
        pixelOffsetY: -80,
        distanceDisplayCondition: true,
        distanceDisplayCondition_far: 80000,
        distanceDisplayCondition_near: 0,
      },
    },
  });
  Lianhua.graphicLayer_daqu_shop_focus_marker.addGraphic(newGraphic);

  if (hasAlertLabel) {
    let { lng, lat, alt } = cartesian3ToLatlng(position);
    let newPosition = latlngToCartesian3(lng, lat, 200);
    var graphicLabel = new mars3d.graphic.DivGraphic({
      position: newPosition,
      style: {
        html: `<div class="alertShopLabel">${shopName}</div>`,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200000), //按视距距离显示
        distanceDisplayCondition: true,
        distanceDisplayCondition_far: 10000000,
        distanceDisplayCondition_near: 0,
      },
    })
    Lianhua.graphicLayer_daqu_shop_focus_marker.addGraphic(graphicLabel)
  }
}

const removeFocusShop = () => {
  Lianhua.graphicLayer_daqu_shop_focus_marker.clear();
}

export default {
  rendererDaqu,
  removeDaqu,
  rendererDaquLine,
  rendererTieluLine,
  rendererDaquShengMarker,
  rendererFocusShop,
  removeFocusShop,
  removeDaquShopMarker,
  bindDaquEventHandler,
  unbindDaquEventHandler,
  controlDaquSpaceCameraController,
  destroyDaquSpaceCameraController,
  removeDaquMask,
};