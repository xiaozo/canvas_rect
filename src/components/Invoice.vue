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

///移动框是否带着孩子框移动
var togetherMove = true

var canvasLeft, canvasTop, gX, gY;
var scale, orginScale = 1;
var translateY, orginTranslateY = 0;
var translateX, orginTranslateX = 0;
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
      url: ""
    }
  },
  mounted() {
    var that = this;


    this.$nextTick(function () {

      var img = new Image();
      img.src = '/static/image1.jpg';

      img.onload = function () {
        orginScale = scale = that.canvasWidth / img.width
        orginTranslateY = translateY = (that.canvasHeight - img.height * scale) / 2.0
        orginTranslateX = translateX = 0
        console.log(orginTranslateY);
        load()
        img.onload = null;//避免重复加载
      }

      function load() {
        $.jCanvas.defaults.fromCenter = false;


        $('canvas')
          .translateCanvas({
            translateX: 0, translateY: translateY
          })
          .scaleCanvas({
            scale: scale
          })



        $('canvas').drawImage({
          layer: true,
          source: '/static/image1.jpg',
          x: 0, y: 0,
        });

        // $('canvas').addLayer({
        //   layer:true,
        //   type: 'rectangle',
        //   fillStyle: '#585',
        //   x: 0, y: -91,
        //   width: 100, height: 50
        // })


        // that.edit(datas[0])


        $("canvas").mousedown(function (e) {
          if (!!currentData) {
            currentData.status = 1;
            canvasLeft = document.getElementById("myCanvas").getBoundingClientRect().left;
            canvasTop = document.getElementById("myCanvas").getBoundingClientRect().top;
            gX = (e.clientX - canvasLeft);
            gY = e.clientY - canvasTop;
            gX /= scale;
            gY /= scale;


          }

        });

        $("canvas").mousemove(function (e) {
          if (!!currentData && currentData.status == 1) {
            var data = currentData;
            var cx = e.clientX - canvasLeft;
            var cy = e.clientY - canvasTop;
            cx /= scale;
            cy /= scale;

            function block() {
              if (currentData.move == true) {
                ///移动
                data.y += cy - gY;
                data.x += cx - gX;

                if (!!togetherMove) {
                  ///带着孩子一起移动
                  var group = currentData.groups[currentData.groups.length - 1]
                  var xx = cx - gX
                  var yy = cy - gY
                  $('canvas').setLayerGroup(group, {
                    x: '+=' + xx,
                    y: '+=' + yy
                  }).drawLayers()
                  return;
                }

              }
              if (currentData.direction == 2) {
                ///右上角
                data.width += cx - gX;
                data.y += cy - gY;
                data.height += gY - cy;
              } else if (currentData.direction == 1) {
                ///左上角
                data.x += cx - gX;
                data.width += gX - cx;
                data.y += cy - gY;
                data.height += gY - cy;

              } else if (currentData.direction == 3) {
                ///左下角
                data.height += cy - gY;
                data.x += cx - gX;
                data.width += gX - cx;

              } else if (currentData.direction == 4) {
                ///右下角
                data.height += cy - gY;
                data.width += cx - gX;

              }

              that.edit(data)
            }

            block()

            gX = cx;
            gY = cy;
          }
        });


        $("body").mouseup(function () {
          if (!!currentData) {
            if (currentData.width < 0) {
              currentData.x += currentData.width;
              currentData.width = -currentData.width;
            }

            if (currentData.height < 0) {
              currentData.y += currentData.height;
              currentData.height = -currentData.height;
            }
            if (!!currentData.move && !!togetherMove) {
              ///重新给孩子data赋值x、y
              var group = currentData.groups[currentData.groups.length - 1]
              var array = $('canvas').getLayerGroup(group)
              for (let index = 0; index < array.length; index++) {
                const element = array[index];
                element.data.data.x = element.x;
                element.data.data.y = element.y;
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
    _addSmallQuestionBySuperData(superData) {
      currentData.isEdit = false;
        this.edit(currentData)
        // currentData = null

        var timestamp = Date.parse(new Date());
        var arr1 = superData.groups.slice(0);
        arr1.push("boxes-child-" + timestamp);
        var groups = arr1
        var point = { x: superData.x + 20, y: superData.y + 20 }
        var childData = {
          x: point.x, y: point.y, width: 50, height: 50, groups: groups, status: 0, isEdit: true, move: false, name: "mybox-c" + timestamp, color: "#585",
          superName: superData.name
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
    _getCenterPoint() {
      var x = (this.canvasWidth / 2.0 - translateX) / scale
      var y = (this.canvasHeight / 2.0 - translateY) / scale

      return { x: x, y: y }
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
      currentData = {
        x: centerPoint.x, y: centerPoint.y, width: 50, height: 50, groups: ["boxes-child-" + timestamp], status: 0, isEdit: true, move: false, name: "mybox-" + timestamp, color: "#000",
        child: []
      }
      this.edit(currentData)
      datas.push(currentData)


    },

    addSmall() {
      if (!!currentData && !!currentData.child) {

        this._addSmallQuestionBySuperData(currentData)


      } else if (!!currentData && currentData.superName) {
        this._addSmallQuestionBySuperData(this._getDataByName(currentData.superName))
        
      }   else {
        alert("选择一个大题框")
      }
    },
    del() {
      if (!!currentData) {
        $('canvas').removeLayerGroup(currentData.groups[currentData.groups.length - 1]).drawLayers();
        if (!!currentData.superName) {
          var superData = this._getDataByName(currentData.superName)
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
      var oscale = scale;
      scale = 1.6;
      var otranslateY = translateY;
      /// (this.canvasHeight / 2.0 - translateY) / oscale 获取中间点的y坐标
      ///(this.canvasHeight / 2.0 - translateY) / oscale * scale 获取放大后的物理坐标
      /// -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0) 获取translateY 偏移量 (确定最终获取translateY)

      translateY = -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0)
      var otranslateX = translateX;
      translateX = -((this.canvasWidth / 2.0 - translateX) / oscale * scale - this.canvasWidth / 2.0)
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


      ///中心点

    },
    scalesmall() {
      var oscale = scale;
      scale = orginScale;

      var otranslateY = translateY;
      /// (this.canvasHeight / 2.0 - translateY) / oscale 获取中间点的y坐标
      ///(this.canvasHeight / 2.0 - translateY) / oscale * scale 获取放大后的物理坐标
      /// -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0) 获取translateY 偏移量 
      translateY = -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0)
      var otranslateX = translateX;
      translateX = -((this.canvasWidth / 2.0 - translateX) / oscale * scale - this.canvasWidth / 2.0)

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
    edit(data) {
      var that = this;
      var { x, y, width, height, groups, name, color } = data


      $('canvas').removeLayerGroup(data.groups[data.groups.length - 1]).drawLayers();


      $('canvas').drawRect({
        layer: true,
        strokeStyle: color,
        strokeWidth: 2,
        name: name,
        groups: groups,
        // source: 'https://projects.calebevans.me/jcanvas/assets/images/fish.jpg',
        x: x, y: y,
        width: width, height: height,
        data: {
          data: data
        },
        mousedown: function (layer) {


          if (!!currentData) {
            currentData.isEdit = false;
            that.edit(currentData)
          }
          currentData = layer.data.data;
          currentData.isEdit = true;
          currentData.move = true;

        },
        // mousemove: function (layer) {

        // },
        // mouseup: function (layer) {
        //   boolmove = false;
        // }

      });

      ///绘制4个点
      if (data.isEdit == true) {
        // console.log(name);
        ///左上角
        $('canvas').drawArc({
          layer: true,
          groups: groups,
          fillStyle: 'gray',
          x: x - 6, y: y - 6,
          radius: 6,
          data: {
            data: data
          },
          mousedown: function (layer) {
            currentData = layer.data.data;
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
            data: data
          },
          mousedown: function (layer) {
            currentData = layer.data.data;
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
            data: data
          },
          mousedown: function (layer) {
            currentData = layer.data.data;
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
            data: data
          },
          mousedown: function (layer) {
            currentData = layer.data.data;
            currentData.direction = 4;

          },
        });


      }

      if (!!data.child) {
        let array = data.child;
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          this.edit(element)
        }
      }

    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
