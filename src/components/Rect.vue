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
import '@/base/jCanvas/jCanvas-extend.js';

var isDragBg = false;
// var collisionCheck = true

var canvasLeft, canvasTop, gX, gY;

///坐标轴缩放比例
// var scale = 1;
///坐标轴移动
// left = document.getElementById("myCanvas").getBoundingClientRect()

/// datas = [
// {
//   x: 50, y: 50, width: 220, height: 138, groups: ["boxes"], status: 0, isEdit: false, move: false, name: "mybox", color: "#000",
//   child: [
//     { x: 60, y: 70, width: 50, height: 60, groups: ["boxes", "boxes-child1"], status: 0, isEdit: false, move: false, name: "mybox-c1", color: "#585" },
//   ]
// },

// ]

export default {
  name: 'invoice',
  data() {
    return {
      canvasWidth: 1000,
      canvasHeight: 800,
      canvas: null,
      url: "",
    }
  },
  mounted() {
    var that = this;

    this.$nextTick(function () {

      var img = new Image();
      img.src = '/static/image1.jpg';

      img.onload = function () {

        that.canvas = $('canvas')

        that.canvas.initCanvas({
          canvasWidth: that.canvasWidth,
          canvasHeight: that.canvasHeight,
          imageWidth: img.width,
          imageHeight: img.height,
          bgUrl: '/static/image1.jpg',
        })

        img.onload = null;//避免重复加载
      }




      // setTimeout(function () {
      //   $('canvas').removeLayerGroup('myBoxes1').drawLayers();
      // }, 2000);

    })
  },
  methods: {

    logcurrent() {
      console.log(this.canvas.currentData);
    },
    addBig() {
      this.canvas.addOutSubject()


    },

    addSmall() {
      try {
        this.canvas.addSubSubject()
      } catch (error) {
        alert(error)
      }
    },
    del() {
      try {
        this.canvas.delSubject()
      } catch (error) {
        alert(error)
      }
    },
    cut() {
      console.log(this.canvas.datas);
      this.url = $('canvas').getCanvasImage('png')

    },
    scalebig() {

      this.canvas.scaleM(1.3)

    },
    scalesmall() {

      this.canvas.scaleM(this.canvas.orginScale)

    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
