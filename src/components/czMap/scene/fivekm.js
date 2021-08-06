/*eslint-disable*/
import { getLotusCust5KM, } from '../../../apis/zd';

import {
  UniqueNameMap, URL, getCustomDataSourceByName, flyToView, latlngToCartesian3, cartesian3ToLatlng,
} from './common';

const handler = null;

const rendererFivekm = (shopCode, position) => {
  removeFivekm();
  // 定位
  // 添加透明层
  const graphic_circle = new mars3d.graphic.CircleEntity({
    position,
    name: 'CircleEntity',
    style: {
      radius: 5000.0,
      color: 'rgb(76,92,119)',
      opacity: 0.4,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#DADADA;',
      outlineOpacity: 0.3,
      clampToGround: true,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(1000, 100000),
    },
  });
  // Lianhua.graphicLayer_daqu_shop_marker.show = false
  Lianhua.graphicLayer_five_shop_marker.clear();
  Lianhua.graphicLayer_five_shop_marker.addGraphic(graphic_circle);

  viewer && viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 5500), {
    offset: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0,
    },
    complete() {
      /* getLotusCust5KM(shopCode).then(data => {
        data && data.map((item, index) => {
          const { status, latitude, longitude, } = item;
          if (longitude && latitude) {
            const jd = parseFloat(longitude) || 114;
            const wd = parseFloat(latitude) || 23;
            const position = new mars3d.LatLngPoint(jd, wd, 0);
            let color = '#EDEDED';
            switch (status) {
              case "1": // 已开拓
                color = '#20D918';
                break;
              case "2": // 开拓失败
                color = '#F90000';
                break;
              case "3": // 开拓中
                color = '#D89D01';
                break;
              case "4": // 未开拓
                color = '#EDEDED';
                break;
              default:
                color = '#EDEDED';
                break;
            }

            const primitive = new mars3d.graphic.PointPrimitive({
              position,
              attr: item,
              style: {
                color: Cesium.Color.fromCssColorString(color),
                pixelSize: 8,
                outline: false,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000),
              },
            });
            Lianhua.graphicLayer_five_shop_marker.addGraphic(primitive);
          }
        })
      })

      Lianhua.graphicLayer_five_shop_marker.on(mars3d.EventType.mouseOver, (event) => {
        if (event.graphic.name === 'CircleEntity') {// 是圆
          Lianhua.graphicLayer_five_shop_dialog.clear();
          return;
        };
        const {
          custName,
          distance,
          isAquatic,
          isChicken,
          isDrinks,
          isEgg,
          isFood,
          isFrozen,
          isFruit,
          isPig,
          isRelish,
          isVegetables,
          kunnrNm,
          kunnrTypeNm,
          latitude,
          longitude,
          netamt,
          netplamt,
          netplamtRate,
          status } = event.graphic.attr;
        if (status !== '1') { //只有已开拓客户才有弹框
          return;
        }
        const graphic = new mars3d.graphic.DivGraphic({
          position: event.graphic.position,
          style: {
            offsetY: -30,
            offsetX: 10,
            html: `<div class="kehu-info">
                <div class="title">
                  <div class="name">${custName || '—'}</div>
                  <div class="unit">单位：千元</div>
                </div>
                <div class="board">
                  <div class="first">
                    <div class="item"><div class="num">${netamt || '—'}</div><div class="subject">销售额</div></div>
                    <div class="item"><div class="num">${netplamt || '—'}</div><div class="subject">利润</div></div>
                    <div class="item"><div class="num">${netplamtRate || '—'}%</div><div class="subject">利润率</div></div>
                  </div>
                  <div class="second">
                    <div class="item">客户类型：${kunnrTypeNm || '—'}</div>
                    <div class="item">距离：${distance || '—'}km</div>
                  </div>
                  <div class="third">
                    <div class="item active"><img width="40px" height="40px" src=${isPig === 'Y' ? require('../assets/category/猪肉-点亮.png') : require('../assets/category/猪肉-灰.png')}><span class="subject">猪肉</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isChicken === 'Y' ? require('../assets/category/鸡肉-点亮.png') : require('../assets/category/鸡肉-灰.png')}><span class="subject">鸡肉</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isEgg === 'Y' ? require('../assets/category/鸡蛋-点亮.png') : require('../assets/category/鸡蛋-灰.png')} /><span class="subject">鸡蛋</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isAquatic === 'Y' ? require('../assets/category/水产-点亮.png') : require('../assets/category/水产-灰.png')} /><span class="subject">水产</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isFrozen === 'Y' ? require('../assets/category/现代食品-点亮.png') : require('../assets/category/现代食品-灰.png')} /><span class="subject">现代食品</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isVegetables === 'Y' ? require('../assets/category/蔬菜-点亮.png') : require('../assets/category/蔬菜-灰.png')} /><span class="subject">蔬菜</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isFruit === 'Y' ? require('../assets/category/水果-点亮.png') : require('../assets/category/水果-灰.png')} /><span class="subject">水果</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isFood === 'Y' ? require('../assets/category/米面-点亮.png') : require('../assets/category/米面-灰.png')} /><span class="subject">米面粮油</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isRelish === 'Y' ? require('../assets/category/调味品-点亮.png') : require('../assets/category/调味品-灰.png')} /><span class="subject">调味品</span></div>
                    <div class="item active"><img width="40px" height="40px" src=${isDrinks === 'Y' ? require('../assets/category/酒水-点亮.png') : require('../assets/category/酒水-灰.png')} /><span class="subject">酒水饮料</span></div>
                  </div>
                </div>
              </div>`,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), // 按视距距离显示
          },
        });

        Lianhua.graphicLayer_five_shop_dialog.clear();
        Lianhua.graphicLayer_five_shop_dialog.addGraphic(graphic);
      }); */
    },
  });
};

const removeFivekm = () => {
  Lianhua.graphicLayer_five_shop_marker.clear();
  Lianhua.graphicLayer_five_shop_dialog.clear();
};

export default {
  rendererFivekm,
  removeFivekm,


};