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

export default {
  name: 'Rect1',
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
