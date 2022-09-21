var canvasLeft, canvasTop, gX, gY;
var isDragBg = false;
$.fn.extend({
  _initCanvas: function () {
    this.togetherMove = true
    this.canvasWidth = 0
    this.canvasHeight = 0
    this.imageWidth = 0
    this.imageHeight = 0
    this.currentData
    this.id=""
  },
  initCanvas: function (config) {
    this._initCanvas();
    for (var key in config) {
      this[key] = config[key]
    }
  },
})


