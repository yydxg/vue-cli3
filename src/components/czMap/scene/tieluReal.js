var graphicLayer;

//时间控制参数
var args = {
  space: 100,
  time: 5,
  martTimeInter: null,
  cleanTimeInter: null,
}

function initReal() {
  //创建Graphic图层
  graphicLayer = new mars3d.layer.GraphicLayer()
  window.map.addLayer(graphicLayer)

  //合肥高铁
  var coors = [
    [117.277697, 31.800233, 45],
    [117.262022, 31.798983, 45],
    [117.229506, 31.793351, 45],
    [117.215719, 31.791085, 45],
    [117.207234, 31.79079, 45],
    [117.180246, 31.790688, 45],
    [117.168311, 31.789785, 45],
    [117.152322, 31.789855, 45],
    [117.125297, 31.788849, 45],
    [117.091144, 31.787516, 45],
  ]

  var positions = mars3d.PointTrans.lonlats2cartesians(coors)

  //插值求新路线（按固定间隔米数插值）
  var positionsNew = mars3d.PolyUtil.interLine(positions, {
    minDistance: 20, //间隔20米
  })

  //求对比的贴地地面高度（用于echarts展示）
  mars3d.PolyUtil.computeSurfacePoints({
    scene: window.map.scene,
    positions: positionsNew, //需要计算的源路线坐标数组
    callback: function (raisedPositions, noHeight) {
      //raisedPositions为含高程信息的新坐标数组，noHeight为标识是否存在无地形数据。
      inintRoad(positionsNew, raisedPositions)
    },
  })
}

//构造动态高铁   positions:设计的路线    positionsTD地面的贴地路线（用于比较）
function inintRoad(positionsSJ, positionsTD) {
  var heightArray = []
  var heightTDArray = []
  var mpoints = []
  for (let i = 0; i < positionsSJ.length; i++) {
    let position = positionsSJ[i]
    let carto = Cesium.Cartographic.fromCartesian(position)
    let x = Cesium.Math.toDegrees(carto.longitude)
    let y = Cesium.Math.toDegrees(carto.latitude)

    let height = mars3d.Util.formatNum(carto.height) //设计高度
    let tdHeight = mars3d.Util.formatNum(Cesium.Cartographic.fromCartesian(positionsTD[i]).height) //地面高度

    heightArray.push(height)
    heightTDArray.push(tdHeight)
    mpoints.push([x, y, height, tdHeight])
  }

  // 距离数组
  var positionsLineFirst = positionsTD[0]
  var distanceArray = positionsTD.map(function (data) {
    return Math.round(Cesium.Cartesian3.distance(data, positionsLineFirst))
  })

  // 画线
  var primitive = new mars3d.graphic.PolylinePrimitive({
    id: '设计路线',
    positions: positionsSJ,
    style: {
      width: 3,
      color: Cesium.Color.RED,
      materialType: mars3d.MaterialType.PolylineDash, //虚线
      dashLength: 20,
    },
  })
  graphicLayer.addGraphic(primitive)

  var primitiveTD = new mars3d.graphic.PolylinePrimitive({
    id: '贴地路线',
    positions: positionsTD,
    style: {
      width: 3,
      color: Cesium.Color.YELLOW,
    },
  })
  graphicLayer.addGraphic(primitiveTD)

  //=================计算路线====================
  var start = window.map.clock.currentTime.clone()

  var counts = mpoints.length

  var arrProperty = []
  var arrTime = []

  //16组车身+头尾2个车头 共18组
  for (let j = 0; j < 18; j++) {
    let stime = Cesium.JulianDate.addSeconds(start, j, new Cesium.JulianDate())
    arrTime.push(stime)

    let property = new Cesium.SampledPositionProperty()

    for (let i = 0; i < counts; i++) {
      let time = Cesium.JulianDate.addSeconds(stime, i + 1, new Cesium.JulianDate())
      let point = Cesium.Cartesian3.fromDegrees(mpoints[i][0], mpoints[i][1], mpoints[i][2] + 0.5)
      property.addSample(time, point)
    }

    property.setInterpolationOptions({
      interpolationDegree: 1,
      interpolationAlgorithm: Cesium.LinearApproximation,
    })
    arrProperty.push(property)
  }

  //=================时间相关====================
  let stop = Cesium.JulianDate.addSeconds(start, mpoints.length + 60, new Cesium.JulianDate())
  window.map.clock.startTime = start.clone()
  window.map.clock.stopTime = stop.clone()
  window.map.clock.currentTime = start.clone()
  window.map.clock.multiplier = 1
  window.map.clock.shouldAnimate = true
  // window.map.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //到达终止时间后循环

  if (window.map.viewer.timeline) {
    window.map.viewer.timeline.zoomTo(start, stop)
  }

  let availability = new Cesium.TimeIntervalCollection([
    new Cesium.TimeInterval({
      start: start,
      stop: Cesium.JulianDate.addSeconds(start, counts, new Cesium.JulianDate()),
    }),
  ])

  //=================添加高铁车头================
  let graphicHead = addTrainHead(arrProperty[0], availability)
  window.map.trackedEntity = graphicHead.entity

  //=================添加车身====================
  let len = arrProperty.length
  for (let j = 1; j < len - 1; j++) {
    addTrainBody(arrProperty[j], availability)
  }

  //车尾部的反向车头
  addTrainHead(arrProperty[len - 1], availability, true)

  //==============添加铁路，定时更新================
  addRailway(graphicHead, mpoints)

  //==============更新echarts================
  /* let lastDistance

  function locTrain() {
    let t = parseInt(window.map.clock.currentTime.secondsOfDay - window.map.clock.startTime.secondsOfDay)
    if (t >= heightArray.length) {
      clearInterval(args.martTimeInter)
      clearInterval(args.cleanTimeInter)
      return
    }
    if (lastDistance == t) {
      return
    }
    lastDistance = t
  }
  args.martTimeInter = setInterval(locTrain, 100) */
}

//添加车头
function addTrainHead(position, availability, rotatePI) {
  var graphicModel = new mars3d.graphic.ModelEntity({
    name: '和谐号车头',
    position: position,
    orientation: new Cesium.VelocityOrientationProperty(position),
    availability: availability,
    style: {
      url: '//data.mars3d.cn/gltf/mars/train/heada.glb',
      scale: 0.001,
      minimumPixelSize: 16,
      heading: rotatePI ? 90 : -90,
      pitch:70,
      roll:100,
    },
  })
  graphicLayer.addGraphic(graphicModel)
  return graphicModel
}

//添加车身
function addTrainBody(position, availability) {
  var graphicModel = new mars3d.graphic.ModelEntity({
    name: '和谐号车身',
    position: position,
    orientation: new Cesium.VelocityOrientationProperty(position),
    availability: availability,
    style: {
      url: '//data.mars3d.cn/gltf/mars/train/body.glb',
      scale: 0.001,
      minimumPixelSize: 16,
      heading: -90,
    },
  })
  graphicLayer.addGraphic(graphicModel)
  return graphicModel
}

//添加铁路，定时更新
function addRailway(graphicHead, mpoints) {
  let positions = []
  let orientations = []

  let times = graphicHead.position._property._times
  let start = times[0].clone()
  let counts = times.length

  let position
  let orientation
  for (let k = 1; k < counts; k++) {
    let time = times[k]

    position = graphicHead.position.getValue(time)
    positions.push(position)

    orientation = graphicHead.orientation.getValue(time)
    orientations.push(orientation)
  }

  let i = 0
  let roadNum = 80

  function addroad() {
    let space = Math.round(window.map.clock.currentTime.secondsOfDay - window.map.clock.startTime.secondsOfDay)
    let spa = space + args.space
    if (spa > counts) {
      spa = counts
    }
    for (; i < spa; i++) {
      let availability = new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: Cesium.JulianDate.addSeconds(start, -roadNum + i, new Cesium.JulianDate()),
          stop: Cesium.JulianDate.addSeconds(start, roadNum + i, new Cesium.JulianDate()),
        }),
      ])

      if (mpoints[i][2] - mpoints[i][3] < -20 || (i > 2 && mpoints[i - 3][2] - mpoints[i - 3][3] < -20)) {
        let id = 's' + i
        let graphic = graphicLayer.getGraphicById(id)
        if (!graphic) {
          let graphicModel = new mars3d.graphic.ModelEntity({
            id: id,
            position: positions[i],
            orientation: orientations[i],
            availability: availability,
            style: {
              url: '//data.mars3d.cn/gltf/mars/railway/suidao.glb',
              scale: 0.001,
            },
          })
          graphicLayer.addGraphic(graphicModel)
        } else {
          graphic.entity.availability._intervals[0].stop.secondsOfDay = availability._intervals[0].stop.secondsOfDay
        }
      }

      let id = 'xl' + i
      let graphic = graphicLayer.getGraphicById(id)
      if (!graphic) {
        let graphicModel = new mars3d.graphic.ModelEntity({
          id: id,
          position: positions[i],
          orientation: orientations[i],
          availability: availability,
          style: {
            url: '//data.mars3d.cn/gltf/mars/railway/railway.glb',
            scale: 0.001,
          },
        })
        graphicLayer.addGraphic(graphicModel)
      } else {
        graphic.entity.availability._intervals[0].stop.secondsOfDay = availability._intervals[0].stop.secondsOfDay
      }

      if (mpoints[i][2] - mpoints[i][3] > 20 && i % 5 == 0) {
        let id = 'xq' + i
        let graphic = graphicLayer.getGraphicById(id)
        if (!graphic) {
          let graphicModel = new mars3d.graphic.ModelEntity({
            id: id,
            position: positions[i],
            orientation: orientations[i],
            availability: availability,
            style: {
              url: '//data.mars3d.cn/gltf/mars/railway/bridge.glb',
              scale: 0.001,
            },
          })
          graphicLayer.addGraphic(graphicModel)
        } else {
          graphic.entity.availability._intervals[0].stop.secondsOfDay = availability._intervals[0].stop.secondsOfDay
        }
      }

      if (i % 12 == 0) {
        let id = 'xd' + i
        let graphic = graphicLayer.getGraphicById(id)
        if (!graphic) {
          let graphicModel = new mars3d.graphic.ModelEntity({
            id: id,
            position: positions[i],
            orientation: orientations[i],
            availability: availability,
            style: {
              url: '//data.mars3d.cn/gltf/mars/railway/jiazi.glb',
              scale: 0.001,
            },
          })
          graphicLayer.addGraphic(graphicModel)
        } else {
          graphic.entity.availability._intervals[0].stop.secondsOfDay = availability._intervals[0].stop.secondsOfDay
        }
      }
    }

    //移除铁路
    for (let j = args.statate; j < args.statate - args.space; j++) {
      removeGraphic('s' + j)
      removeGraphic('xl' + j)
      removeGraphic('xq' + j)
      removeGraphic('xd' + j)
      args.statate = j
    }
  }

  addroad()

  args.cleanTimeInter = setInterval(addroad, args.time)
  args.statate = 0
}

function removeGraphic(id) {
  let graphic = graphicLayer.getGraphicById(id)
  if (graphic) {
    if (graphic.entity.availability._intervals[0].stop.secondsOfDay < window.map.clock.currentTime.secondsOfDay) {
      graphic.remove(true)
    }
  }
}

export default {
  initReal
}