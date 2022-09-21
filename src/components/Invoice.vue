<template>
  <div>
    <canvas :width="canvasWidth" :height="canvasHeight" id="myCanvas" style="background:red"></canvas>
    <button @click="addBig">增加大题目</button>
    <button @click="addSmall">增加小题目</button>
    <button @click="del">删除</button>
    <button @click="cut">截取</button>
    <button @click="scalebig">放大</button>
    <button @click="scalesmall">缩小</button>
    <button @click="logcurrent">打印当前</button>
    <img :src="url">
  </div>


</template>

<script>
import '@/base/jCanvas-extend.js';

///移动框是否带着孩子框移动
var togetherMove = true
var isDragBg = false;

var canvasLeft, canvasTop, gX, gY;

///坐标轴缩放比例
var scale, orginScale = 1;
///坐标轴移动
var translateY = 0;
var translateX = 0;
// left = document.getElementById("myCanvas").getBoundingClientRect()

var datas = [
  // {
  //   x: 50, y: 50, width: 220, height: 138, groups: ["boxes"], status: 0, isEdit: false, move: false, name: "mybox", color: "#000",
  //   child: [
  //     { x: 60, y: 70, width: 50, height: 60, groups: ["boxes", "boxes-child1"], status: 0, isEdit: false, move: false, name: "mybox-c1", color: "#585" },
  //   ]
  // },

]
// var data = { x: 50, y: 50, width: 220, height: 138, groups: ["boxes"], isEdit: true, move: false }

var currentData;

export default {
  name: 'invoice',
  data() {
    return {
      canvasWidth: 1000,
      canvasHeight: 800,
      imageWidth: 0,
      imageHeight: 0,
      translateY: 0,
      translateX: 0,
      url: ""
    }
  },
  mounted() {
    var that = this;

    this.$nextTick(function () {

      var img = new Image();
      img.src = '/static/image1.jpg';

      img.onload = function () {
        that.imageWidth = img.width
        that.imageHeight = img.height

        orginScale = scale = that.canvasWidth / img.width
        translateY = (that.canvasHeight - img.height * scale) / 2.0
        translateX = 0
        console.log(translateY);
        load()
        img.onload = null;//避免重复加载
      }

      function load() {
        $.jCanvas.defaults.fromCenter = false;


        $('canvas')
          .translateCanvas({
            translateX: translateX, translateY: translateY
          })
          .scaleCanvas({
            scale: scale
          })



        $('canvas').drawImage({
          layer: true,
          source: '/static/image1.jpg',
          x: 0, y: 0,
          mousedown: function (layer) {
            isDragBg = true

          },
        });


        $("canvas").mousedown(function (e) {
          if (!!currentData || !!isDragBg) {
            canvasLeft = document.getElementById("myCanvas").getBoundingClientRect().left;
            canvasTop = document.getElementById("myCanvas").getBoundingClientRect().top;
            gX = (e.clientX - canvasLeft);
            gY = e.clientY - canvasTop;

            if (!isDragBg) {
              currentData.status = 1;
              gX /= scale;
              gY /= scale;
            }
          }

        });

        $("canvas").mousemove(function (e) {
          if (!!isDragBg) {
            ///拖动bg
            var cx = e.clientX - canvasLeft;
            var cy = e.clientY - canvasTop;

            that.translate(translateX - (gX - cx), translateY - (gY - cy))
            gX = cx;
            gY = cy;
            return
          }

          if (!!currentData && currentData.status == 1) {
            var data = currentData;
            var activePoint = currentData.activePoint
            var cx = e.clientX - canvasLeft;
            var cy = e.clientY - canvasTop;
            cx /= scale;
            cy /= scale;

            function block() {
              if (currentData.move == true) {
                ///移动
                activePoint.y += cy - gY;
                activePoint.x += cx - gX;

                if (!!togetherMove) {
                  ///带着孩子一起移动
                  var group = activePoint.groups[activePoint.groups.length - 1]
                  var xx = cx - gX
                  var yy = cy - gY
                  $('canvas').setLayerGroup(group, {
                    x: '+=' + xx,
                    y: '+=' + yy
                  }).drawLayers()
                  return;
                }

              }
              // if (!!activePoint.superName) {
              //   ///不超过父视图
              //   var point = that._getCoordinatePointByLeftTop(e.clientX - canvasLeft, e.clientY - canvasTop)

              //   // var { x, y, width, height } = $('canvas').getLayer(activePoint.superName)
              //   if (!that._pointInRect(point, $('canvas').getLayer(activePoint.superName))) {
              //     ///不在矩形内
              //     return
              //   }

              // }

              if (currentData.direction == 2) {
                ///右上角
                activePoint.width += cx - gX;
                activePoint.y += cy - gY;
                activePoint.height += gY - cy;
              } else if (currentData.direction == 1) {
                ///左上角
                activePoint.x += cx - gX;
                activePoint.width += gX - cx;
                activePoint.y += cy - gY;
                activePoint.height += gY - cy;

              } else if (currentData.direction == 3) {
                ///左下角
                activePoint.height += cy - gY;
                activePoint.x += cx - gX;
                activePoint.width += gX - cx;

              } else if (currentData.direction == 4) {
                ///右下角
                activePoint.height += cy - gY;
                activePoint.width += cx - gX;

              }

              that.edit(data)
            }

            block()

            gX = cx;
            gY = cy;
          }
        });


        $("body").mouseup(function () {
          if (!!isDragBg) {
            isDragBg = false
            ///拖动bg
            return
          }

          if (!!currentData) {
            ///因为进过拉伸会变成height或者width变成负数，需要转换成标准的x,y,width,heigh,然后进行重绘
            var activePoint = currentData.activePoint
            if (activePoint.width < 0) {
              activePoint.x += activePoint.width;
              activePoint.width = -activePoint.width;
            }

            if (activePoint.height < 0) {
              activePoint.y += activePoint.height;
              activePoint.height = -activePoint.height;
            }


            if (!!currentData.move && !!togetherMove) {
              ///进过移动后,重新给child的数据模型赋值x、y
              var group = activePoint.groups[activePoint.groups.length - 1]
              var array = $('canvas').getLayerGroup(group)
              for (let index = 0; index < array.length; index++) {
                const element = array[index];
                element.data.data.points[element.data.index].x = element.x;
                element.data.data.points[element.data.index].y = element.y;
              }

            }

            that.edit(currentData)

            currentData.direction = 0;
            currentData.move = false;
            currentData.status = 0;

          }

        });
      }



      // setTimeout(function () {
      //   $('canvas').removeLayerGroup('myBoxes1').drawLayers();
      // }, 2000);

    })
  },
  methods: {
    ///两个矩形是否相交
    _checkIntersect(rectA, rectB) {
      if ((rectA.x + rectA.width < rectB.x) ||
        (rectA.x > rectB.x + rectB.width) ||
        (rectA.y + rectA.height < rectB.y) ||
        (rectA.y > rectB.y + rectB.height)
      ) {
        return false
      }
      return true
    },
    ///判断点是否在矩形内
    _pointInRect(point, rect) {
      var { x, y, width, height } = rect
      if (!((point.x >= x && point.x <= x + width)
        && (point.y >= y && point.y <= y + height))
      ) {
        ///不在矩形内
        return false
      }
      return true
    },
    ///根据视图上的距离转成坐标的x,y
    _getCoordinatePointByLeftTop(left, top) {
      return {
        x: (left - translateX) / scale,
        y: (top - translateY) / scale,
      }
    },
    ///得到中间的点的真实坐标
    _getCenterPoint() {
      var x = (this.canvasWidth / 2.0 - translateX) / scale
      var y = (this.canvasHeight / 2.0 - translateY) / scale

      return { x: x, y: y }
    },
    ///调整Translate,使图片展示完整
    _adjuestTranslate(_translateX, _translateY) {
      if (_translateY > 0) {
        _translateY = 0

        if (this.imageHeight * scale < this.canvasHeight) {
          _translateY = (this.canvasHeight - this.imageHeight * scale) / 2.0
        }
      }

      if (_translateX > 0) {
        _translateX = 0

        if (this.imageWidth * scale < this.canvasWidth) {
          _translateX = (this.canvasWidth - this.imageWidth * scale) / 2.0
        }
      }


      if (this.canvasWidth - _translateX > this.imageWidth * scale) {
        _translateX = Math.min(this.canvasWidth - this.imageWidth * scale, (this.canvasWidth - this.imageWidth * scale) / 2.0);
      }

      if (this.canvasHeight - _translateY > this.imageHeight * scale) {
        _translateY = Math.min(this.canvasHeight - this.imageHeight * scale, (this.canvasHeight - this.imageHeight * scale) / 2.0);
      }

      return {
        translateX: _translateX,
        translateY: _translateY
      }

    },
    _addSmallQuestionBySuperData(superData) {
      currentData.isEdit = false;
      this.edit(currentData)
      // currentData = null

      var activePoint = superData.activePoint;
      if (!activePoint) return;

      var timestamp = Date.parse(new Date());
      var arr1 = activePoint.groups.slice(0);
      arr1.push("boxes-child-" + timestamp);
      var groups = arr1
      var point = { x: activePoint.x + 20, y: activePoint.y + 20 }
      var childPoint = { x: point.x, y: point.y, width: 50, height: 50, groups: groups, name: "mybox-c" + timestamp, superName: activePoint.name }
      var childData = {
        points: [
          childPoint
        ],
        status: 0, isEdit: true, move: false, color: "#585", activePoint: childPoint,

      }
      superData.child.push(childData)

      currentData = childData
      this.edit(currentData)

    },
    _getDataByName(name) {
      //  return $('canvas').getLayer(name)?.data.data;
      if (!!$('canvas').getLayer(name)) {
        return $('canvas').getLayer(name).data.data
      }
      return null

    },
    logcurrent() {
      console.log(currentData);
    },
    addBig() {
      if (!!currentData) {
        currentData.isEdit = false;
        this.edit(currentData)
        currentData = null
      }

      var timestamp = Date.parse(new Date());
      var centerPoint = this._getCenterPoint();
      var point = { x: centerPoint.x, y: centerPoint.y, width: 50, height: 50, groups: ["boxes-child-" + timestamp], name: "mybox-" + timestamp }
      currentData = {
        points: [
          point
        ],
        status: 0, isEdit: true, move: false, color: "#000", activePoint: point,
        child: []
      }
      this.edit(currentData)
      datas.push(currentData)


    },

    addSmall() {
      if (!!currentData && !!currentData.child) {
        this._addSmallQuestionBySuperData(currentData)
      } else if (!!currentData && currentData.activePoint.superName) {
        this._addSmallQuestionBySuperData(this._getDataByName(currentData.activePoint.superName))

      } else {
        alert("选择一个大题框")
      }
    },
    del() {
      if (!!currentData) {
        var activePoint = currentData.activePoint
        $('canvas').removeLayerGroup(activePoint.groups[activePoint.groups.length - 1]).drawLayers();
        if (!!activePoint.superName) {
          var superData = this._getDataByName(activePoint.superName)
          ///小题
          var s = superData.child

          s.splice(s.indexOf(currentData), 1)
          this.edit(superData)
        } else {
          ///大题
          var s = datas
          s.splice(s.indexOf(currentData), 1)
        }
        currentData = null
      }
    },
    cut() {
      console.log(datas);
      this.url = $('canvas').getCanvasImage('png')

    },
    scalebig() {

      this.scale(1.3)

    },
    scalesmall() {

      this.scale(orginScale)

    },
    translate(_translateX, _translateY) {
      var otranslateY = translateY;
      var otranslateX = translateX;

      const xyDict = this._adjuestTranslate(_translateX, _translateY)
      translateX = xyDict.translateX
      translateY = xyDict.translateY

      var oscale = scale;

      $('canvas')
        ///先进行1.0的缩放还原,不然后续的translateCanvas会有问题,因为translate的是基于scale:1.0计算位置
        .scaleCanvas({
          scale: 1 / oscale
        })
        .translateCanvas({
          translateX: translateX - otranslateX, translateY: translateY - otranslateY
        })
        .scaleCanvas({
          scale: scale
        })
        .drawLayers()
    },
    scale(_scale) {
      var oscale = scale;
      scale = _scale;

      /// (this.canvasHeight / 2.0 - translateY) / oscale 获取中间点的y坐标
      ///(this.canvasHeight / 2.0 - translateY) / oscale * scale 获取放大后的物理坐标
      /// -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0) 获取translateY 偏移量 (确定最终获取translateY)
      var otranslateY = translateY;
      translateY = -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0)
      var otranslateX = translateX;
      translateX = -((this.canvasWidth / 2.0 - translateX) / oscale * scale - this.canvasWidth / 2.0)

      const xyDict = this._adjuestTranslate(translateX, translateY)
      translateX = xyDict.translateX
      translateY = xyDict.translateY

      $('canvas')
        ///先进行1.0的缩放还原,不然后续的translateCanvas会有问题,因为translate的是基于scale:1.0计算位置
        .scaleCanvas({
          scale: 1 / oscale
        })
        .translateCanvas({
          translateX: translateX - otranslateX, translateY: translateY - otranslateY
        })
        .scaleCanvas({
          scale: scale
        })
        .drawLayers()
    },
    edit(maindata) {
      var that = this;

      for (let index = 0; index < maindata.points.length; index++) {
        const data = maindata.points[index];
        var { x, y, width, height, groups, name } = data
        var { color } = maindata
        $('canvas').removeLayerGroup(data.groups[data.groups.length - 1]).drawLayers();

        $('canvas').drawRect({
          layer: true,
          strokeStyle: color,
          strokeWidth: 2,
          name: name,
          groups: groups,
          x: x, y: y,
          width: width, height: height,
          data: {
            data: maindata, index: index
          },
          mousedown: function (layer) {


            if (!!currentData) {
              currentData.isEdit = false;
              that.edit(currentData)
            }
            currentData = layer.data.data;
            currentData.activePoint = currentData.points[layer.data.index]
            currentData.isEdit = true;
            currentData.move = true;

          },
        });

        ///绘制4个点
        if (maindata.isEdit == true) {
          // console.log(name);
          ///左上角
          $('canvas').drawArc({
            layer: true,
            groups: groups,
            fillStyle: 'gray',
            x: x - 6, y: y - 6,
            radius: 6,
            data: {
              data: maindata, index: index
            },
            mousedown: function (layer) {
              currentData = layer.data.data;
              currentData.activePoint = currentData.points[layer.data.index]
              currentData.direction = 1;

            },
          });


          ///右上角
          $('canvas').drawArc({
            layer: true,
            groups: groups,
            fillStyle: 'gray',
            x: x + width - 6, y: y - 6,
            radius: 6,
            data: {
              data: maindata, index: index
            },
            mousedown: function (layer) {
              currentData = layer.data.data;
              currentData.activePoint = currentData.points[layer.data.index]
              currentData.direction = 2;

            },
          });

          ///左下角
          $('canvas').drawArc({
            layer: true,
            groups: groups,
            fillStyle: 'gray',
            x: x - 6, y: y + height - 6,
            radius: 6,
            data: {
              data: maindata, index: index
            },
            mousedown: function (layer) {
              currentData = layer.data.data;
              currentData.activePoint = currentData.points[layer.data.index]
              currentData.direction = 3;

            },
          });

          ///右下角
          $('canvas').drawArc({
            layer: true,
            groups: groups,
            fillStyle: 'gray',
            x: x + width - 6, y: y + height - 6,
            radius: 6,
            data: {
              data: maindata, index: index
            },
            mousedown: function (layer) {
              currentData = layer.data.data;
              currentData.activePoint = currentData.points[layer.data.index]
              currentData.direction = 4;

            },
          });


        }

        if (!!maindata.child) {
          let array = maindata.child;
          for (let index = 0; index < array.length; index++) {
            const element = array[index];
            this.edit(element)
          }
        }
      }

    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
