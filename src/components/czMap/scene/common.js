export const URL = {
  // 中国边界
  chinaBoundary: require('../data/chinaForZd.json'), // guojie
  // 大区省界
  daqu_polygon: require('../data/daqu.json'),
  // 大区边界线
  daqu_line: require('../data/daqu_line.json'),
  // 大区marker
  daqu_marker: require('../data/daqu.json'),
  // 大区maker png
  daqu_marker_default: require('../assets/shop_default.png'),
  daqu_marker_profit: require('../assets/profit.png'),
  daqu_marker_loss: require('../assets/loss.png'),

  // 大区边界线
  tielu_line: require('../data/tielu.json'),
};

// datasource 及其他的唯一值name
export const UniqueNameMap = {
  daqu_polygon: 'daqu_polygon',
  daqu_line: 'daqu_line',
  tielu_line: 'tielu_line',
  daqu_sheng_marker: 'daqu_sheng_marker',
  daqu_sheng_dialog: 'daqu_sheng_dialog',
  daqu_shop_marker: 'daqu_shop_marker',
  daqu_shop_focus_marker: 'daqu_shop_focus_marker',
  daqu_marker: 'daqu_marker',
  daqu_polygon_hightlight: 'daqu_polygon_hightlight',
  five_shop_marker: 'five_shop_marker',
  five_shop_dialog: 'five_shop_dialog',
};

export function setCursor(type) {
  switch (type) {
    case 'hand':
      viewer._container.style.cursor = 'hand';
      break;
    case 'pointer':
      viewer._container.style.cursor = 'pointer';
      break;
    case 'crosshair':
      viewer._container.style.cursor = 'crosshair';
      break;
    case 'default':
      viewer._container.style.cursor = 'default';
      break;
  }
}

export function getCustomDataSourceByName(name) {
  if (!name || name === '') return null;
  return viewer.dataSources._dataSources.find((item) => item.name === name);
}

// 将延迟函数封装成promise对象
export async function delayTime(num) {
  return new Promise((resolve) => { // return / await 等待执行完
    setTimeout(() => {
      resolve('延迟');
    }, num);
  });
}

// 场景模式，2d,3d切换
export function setSceneMode(modeType = 3) {
  viewer && (viewer.scene.mode = modeType);
}

export function flyToView(destination, orientation, duration) {
  viewer && viewer.camera.flyTo({
    destination,
    orientation: orientation || {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0,
    },
    duration: duration || 3,
    complete: () => {
      setTimeout(() => {
      }, 2000);
    },
  });
}

export function latlngToCartesian3(lng, lat, alt) {
  const { ellipsoid } = viewer.scene.globe;
  const cartographic = Cesium.Cartographic.fromDegrees(lng, lat, alt);
  const cartesian3 = ellipsoid.cartographicToCartesian(cartographic);
  return cartesian3;
}

export function cartesian3ToLatlng(cartesian3) {
  const { ellipsoid } = viewer.scene.globe;
  const cartographic = ellipsoid.cartesianToCartographic(cartesian3);
  const lat = Cesium.Math.toDegrees(cartographic.latitude);
  const lng = Cesium.Math.toDegrees(cartographic.longitude);
  const alt = cartographic.height;
  return { lng, lat, alt };
}