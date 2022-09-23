var canvasLeft, canvasTop, gX, gY;
var isDragBg = false;
$.fn.extend({
  _initCanvas: function () {
    this.togetherMove = true
    this.canvasWidth = 0
    this.canvasHeight = 0
    this.imageWidth = 0
    this.imageHeight = 0
    this.togetherMove = true
    this.collisionCheck = true
    this.datas = []
    this.bgUrl = ""

   
  },
  _tempData(data) {
    return {
      x: data.activePoint.x,
      y: data.activePoint.y,
      width: data.activePoint.width,
      height: data.activePoint.height,
      direction: data.direction
    }
  },
  ///计算矩形的距离
  _minDistanceOfRectangles(rect1, rect2) {

    var min_dist;

    //首先计算两个矩形中心点
    var C1 = { x: 0, y: 0 },
      C2 = { x: 0, y: 0 }

    C1.x = rect1.x + (rect1.width / 2);
    C1.y = rect1.y + (rect1.height / 2);
    C2.x = rect2.x + (rect2.width / 2);
    C2.y = rect2.y + (rect2.height / 2);

    // 分别计算两矩形中心点在X轴和Y轴方向的距离
    var Dx, Dy;
    Dx = Math.abs(C2.x - C1.x);
    Dy = Math.abs(C2.y - C1.y);

    //两矩形不相交，在X轴方向有部分重合的两个矩形，最小距离是上矩形的下边线与下矩形的上边线之间的距离
    if ((Dx < ((rect1.width + rect2.width) / 2)) && (Dy >= ((rect1.height + rect2.height) / 2))) {
      min_dist = Dy - ((rect1.height + rect2.height) / 2);
    }

    //两矩形不相交，在Y轴方向有部分重合的两个矩形，最小距离是左矩形的右边线与右矩形的左边线之间的距离
    else if ((Dx >= ((rect1.width + rect2.width) / 2)) && (Dy < ((rect1.height + rect2.height) / 2))) {
      min_dist = Dx - ((rect1.width + rect2.width) / 2);
    }

    //两矩形不相交，在X轴和Y轴方向无重合的两个矩形，最小距离是距离最近的两个顶点之间的距离，
    // 利用勾股定理，很容易算出这一距离
    else if ((Dx >= ((rect1.width + rect2.width) / 2)) && (Dy >= ((rect1.height + rect2.height) / 2))) {
      var delta_x = Dx - ((rect1.width + rect2.width) / 2);
      var delta_y = Dy - ((rect1.height + rect2.height) / 2);
      min_dist = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
    }

    //两矩形相交，最小距离为负值，返回-1
    else {
      min_dist = -1;
    }

    return min_dist;
  },
  ///调整成标准的rect
  _adjuestRectStandard(rect) {
    var { x, y, width, height } = rect
    if (width < 0) {
      x += width;
      width = -width;
    }

    if (height < 0) {
      y += height;
      height = -height;
    }
    return { x: x, y: y, width: width, height: height }
  },
  ///两个矩形是否相交
  _checkIntersect(rectA, rectB) {
    rectA = this._adjuestRectStandard(rectA)
    rectB = this._adjuestRectStandard(rectB)

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
    const scale = this.scale
    const translateX = this.translateX
    const translateY = this.translateY
    return {
      x: (left - translateX) / scale,
      y: (top - translateY) / scale,
    }
  },
  ///得到中间的点的真实坐标
  _getCenterPoint() {
    const scale = this.scale
    const translateX = this.translateX
    const translateY = this.translateY

    var x = (this.canvasWidth / 2.0 - translateX) / scale
    var y = (this.canvasHeight / 2.0 - translateY) / scale

    return { x: x, y: y }
  },
  ///调整Translate,使图片展示完整
  _adjuestTranslate(_translateX, _translateY) {
    const scale = this.scale
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
    var data = this.currentData

    data.isEdit = false;
    this.edit(data)

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

    this.edit(childData)

    data = childData
    this.currentData = data
  },
  _getDataByName(name) {
    const layer = this.getLayer(name)
    if (!!layer) {
      return layer.data.data
    }
    return null

  },
  _canvas_load: function () {
    var that = this;
    that.orginScale = that.scale = that.canvasWidth / that.imageWidth
    that.translateY = (that.canvasHeight - that.imageHeight * that.scale) / 2.0
    that.translateX = 0

    $.jCanvas.defaults.fromCenter = false;


    this
      .translateCanvas({
        translateX: that.translateX, translateY: that.translateY
      })
      .scaleCanvas({
        scale: that.scale
      })

    this.drawImage({
      layer: true,
      source: this.bgUrl,
      x: 0, y: 0,
      mousedown: function (layer) {
        isDragBg = true

      },
    });



    this.mousedown(function (e) {
      const data = that.currentData
      const scale = that.scale
      if (!!data || !!isDragBg) {
        const boundingClientRect = that[0].getBoundingClientRect()
        canvasLeft = boundingClientRect.left;
        canvasTop = boundingClientRect.top;
        gX = (e.clientX - canvasLeft);
        gY = e.clientY - canvasTop;

        if (!isDragBg) {
          data.status = 1;
          gX /= scale;
          gY /= scale;

          if (!data.superName && data.direction > 0 && !!that.collisionCheck) {
            const activePoint = data.activePoint;
           
            var quadrantClassifyBlock = function (point, rect, quadrantPoints) {
              ///第一 第二
              ///第三 第四
              var { x, y } = point
              var { x: rectX, y: rectY, width: rectWidth, height: rectHeight } = rect

              if (y > rectY + rectHeight) {
                ///第一或者第二
                if (x <= rectX) {
                  ///第二
                  quadrantPoints[1].push(rect)
                } else if (x > rectX && x < rectX + rectWidth) {
                  ///第一 第二
                  quadrantPoints[0].push(rect)
                  quadrantPoints[1].push(rect)
                } else {
                  ///第一
                  quadrantPoints[0].push(rect)
                }
              } else if (y < rectY) {
                ///第三或者第四
                if (x <= rectX) {
                  ///第四
                  quadrantPoints[3].push(rect)
                } else if (x > rectX && x < rectX + rectWidth) {
                  ///第三 第四
                  quadrantPoints[2].push(rect)
                  quadrantPoints[3].push(rect)
                } else {
                  ///第三
                  quadrantPoints[2].push(rect)
                }
              } else {
                ///1或者2或者3或者4
                if (x <= rectX) {
                  ///第二 第四
                  quadrantPoints[1].push(rect)
                  quadrantPoints[3].push(rect)
                } else if (x > rectX && x < rectX + rectWidth) {

                  ///第一 第二 第三 第四
                  quadrantPoints[0].push(rect)
                  quadrantPoints[1].push(rect)
                  quadrantPoints[2].push(rect)
                  quadrantPoints[3].push(rect)
                } else {
                  ///第一 第三
                  quadrantPoints[0].push(rect)
                  quadrantPoints[2].push(rect)

                }
              }
            }
            var immobilityPoint;
            var list = that.datas

            var quadrant = {
              immobilityPoint: null,
              quadrantPoints: [[], [], [], []],

            };
            that.tempQuadrant = quadrant

            if (data.direction == 1) {
              ///左上角
              immobilityPoint = { x: activePoint.x + activePoint.width, y: activePoint.y + activePoint.height }
            } else if (data.direction == 2) {
              ///右上角
              immobilityPoint = { x: activePoint.x, y: activePoint.y + activePoint.height }
            } else if (data.direction == 3) {
              ///左下角
              immobilityPoint = { x: activePoint.x + activePoint.width, y: activePoint.y }
            } else if (data.direction == 4) {
              ///右下角
              immobilityPoint = { x: activePoint.x, y: activePoint.y }
            }

            quadrant.immobilityPoint = immobilityPoint
           
            for (let index = 0; index < list.length; index++) {
              const element = list[index];
              if (element != data) {
                for (let index = 0; index < element.points.length; index++) {
                  const rect = element.points[index];
                  quadrantClassifyBlock(immobilityPoint, rect, quadrant.quadrantPoints)

                }
              }

            }

            console.log(that.tempQuadrant);
            ///quadrantPoints进行距离近的排序
            for (let index = 0; index < quadrant.quadrantPoints.length; index++) {
              const quadrantPoints = quadrant.quadrantPoints[index];
              if (quadrantPoints.length > 3) {
                quadrantPoints.sort(function (rect1, rect2) {
                  var rect1D = Math.min(
                    Math.abs(immobilityPoint.x - rect1.x),
                    Math.abs(immobilityPoint.y - rect1.y)
                  )

                  var rect2D = Math.min(
                    Math.abs(immobilityPoint.x - rect2.x),
                    Math.abs(immobilityPoint.y - rect2.y)
                  )

                  return rect1D - rect2D
                });
              }
            }

          }


        }
      }

    });

    this.mousemove(function (e) {
      const data = that.currentData;
      const scale = that.scale
      if (!!isDragBg) {
        ///拖动bg
        var cx = e.clientX - canvasLeft;
        var cy = e.clientY - canvasTop;

        that.translate(that.translateX - (gX - cx), that.translateY - (gY - cy))
        gX = cx;
        gY = cy;
        return
      }

      if (!!data && data.status == 1) {
        const oldData = that._tempData(data)
        const activePoint = data.activePoint
        var cx = e.clientX - canvasLeft;
        var cy = e.clientY - canvasTop;
        cx /= scale;
        cy /= scale;

        var block = function () {

          if (data.move == true) {
            ///移动
            activePoint.y += cy - gY;
            activePoint.x += cx - gX;

            if (!!that.togetherMove) {
              ///带着孩子一起移动
              var group = activePoint.groups[activePoint.groups.length - 1]
              var xx = cx - gX
              var yy = cy - gY
              that.setLayerGroup(group, {
                x: '+=' + xx,
                y: '+=' + yy
              }).drawLayers()
              return;
            }

          }

          ///正在点击的点
          var clickPoint;
          if (data.direction == 2) {
            ///右上角
            activePoint.width += cx - gX;
            activePoint.y += cy - gY;
            activePoint.height += gY - cy;
            clickPoint = { x: activePoint.x + activePoint.width, y: activePoint.y }
          } else if (data.direction == 1) {
            ///左上角
            activePoint.x += cx - gX;
            activePoint.width += gX - cx;
            activePoint.y += cy - gY;
            activePoint.height += gY - cy;
            clickPoint = { x: activePoint.x, y: activePoint.y }
          } else if (data.direction == 3) {
            ///左下角
            activePoint.height += cy - gY;
            activePoint.x += cx - gX;
            activePoint.width += gX - cx;
            clickPoint = { x: activePoint.x, y: activePoint.y + activePoint.height }
          } else if (data.direction == 4) {
            ///右下角
            activePoint.height += cy - gY;
            activePoint.width += cx - gX;
            clickPoint = { x: activePoint.x + activePoint.width, y: activePoint.y + activePoint.height }
          }

          if (!!activePoint.superName) {
            ///不超过父视图
            var point = clickPoint
            if (!that._pointInRect(point, that.getLayer(activePoint.superName))) {
              ///不在矩形内 activePoint进行还原
              activePoint.x = oldData.x
              activePoint.y = oldData.y
              activePoint.width = oldData.width
              activePoint.height = oldData.height
            }

          } else {
            var quadrant = that.tempQuadrant
            if (!!that.collisionCheck && !!quadrant) {
              ///父视图不超过其他视图
              var immobilityPoint = quadrant.immobilityPoint
              var otherRects = [];
              if (clickPoint.x <= immobilityPoint.x && clickPoint.y <= immobilityPoint.y) {
                ///第一的数组
                otherRects = quadrant.quadrantPoints[0]
              } else if (clickPoint.x > immobilityPoint.x && clickPoint.y <= immobilityPoint.y) {
                ///第二的数组
                otherRects = quadrant.quadrantPoints[1]
              } else if (clickPoint.x <= immobilityPoint.x && clickPoint.y >= immobilityPoint.y) {
                ///第三的数组
                otherRects = quadrant.quadrantPoints[2]
              } else {
                otherRects = quadrant.quadrantPoints[3]
              }

              var iscollision = false
              for (let index = 0; index < otherRects.length; index++) {
                const otherRect = otherRects[index];
                ///如果两个rect本来就相交的就不检测碰撞 that._checkIntersect(oldData, otherRect)
                iscollision = !that._checkIntersect(oldData, otherRect) && that._checkIntersect(activePoint, otherRect)
                if (!!iscollision) break
              }

              if (!!iscollision) {
                ///不在矩形内 activePoint进行还原
                activePoint.x = oldData.x
                activePoint.y = oldData.y
                activePoint.width = oldData.width
                activePoint.height = oldData.height

              }
            }

          }

          that.edit(data)
        }


        block()

        gX = cx;
        gY = cy;
      }
    });

    $("body").mouseup(function () {
      that.tempQuadrant = null
      const data = that.currentData

      if (!!isDragBg) {
        isDragBg = false
        ///拖动bg
        return
      }

      if (!!data) {

        ///因为进过拉伸会变成height或者width变成负数，需要转换成标准的x,y,width,heigh,然后进行重绘
        var activePoint = data.activePoint
        if (activePoint.width < 0) {
          activePoint.x += activePoint.width;
          activePoint.width = -activePoint.width;
        }

        if (activePoint.height < 0) {
          activePoint.y += activePoint.height;
          activePoint.height = -activePoint.height;
        }


        if (!!data.move && !!that.togetherMove) {
          ///进过移动后,重新给child的数据模型赋值x、y
          var group = activePoint.groups[activePoint.groups.length - 1]

          var array = that.getLayerGroup(group)

          for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (!!element.name) {
              ///有名字才有模型
              element.data.data.points[element.data.index].x = element.x;
              element.data.data.points[element.data.index].y = element.y;
            }

          }

        }

        that.edit(data)

        data.direction = 0;
        data.move = false;
        data.status = 0;
        // currentData = null
      }

    });


  },


})

$.fn.extend({
  initCanvas: function (config) {

    this._initCanvas();
    for (var key in config) {
      this[key] = config[key]
    }
    this._canvas_load()

  },
  ///移动
  translate(_translateX, _translateY) {
    const scale = this.scale
    var translateX = this.translateX
    var translateY = this.translateY

    var otranslateY = translateY;
    var otranslateX = translateX;

    const xyDict = this._adjuestTranslate(_translateX, _translateY)
    translateX = xyDict.translateX
    translateY = xyDict.translateY

    var oscale = scale;

    this
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

    this.translateX = translateX
    this.translateY = translateY
  },
  scaleM(_scale) {
    var translateX = this.translateX
    var translateY = this.translateY

    var oscale = this.scale;
    this.scale = _scale;

    /// (this.canvasHeight / 2.0 - translateY) / oscale 获取中间点的y坐标
    ///(this.canvasHeight / 2.0 - translateY) / oscale * scale 获取放大后的物理坐标
    /// -((this.canvasHeight / 2.0 - translateY) / oscale * scale - this.canvasHeight / 2.0) 获取translateY 偏移量 (确定最终获取translateY)
    var otranslateY = translateY;
    translateY = -((this.canvasHeight / 2.0 - translateY) / oscale * this.scale - this.canvasHeight / 2.0)
    var otranslateX = translateX;
    translateX = -((this.canvasWidth / 2.0 - translateX) / oscale * this.scale - this.canvasWidth / 2.0)

    console.log(this.translateX);

    const xyDict = this._adjuestTranslate(translateX, translateY)
    translateX = xyDict.translateX
    translateY = xyDict.translateY

    console.log(translateX);

    this
      ///先进行1.0的缩放还原,不然后续的translateCanvas会有问题,因为translate的是基于scale:1.0计算位置
      .scaleCanvas({
        scale: 1 / oscale
      })
      .translateCanvas({
        translateX: translateX - otranslateX, translateY: translateY - otranslateY
      })
      .scaleCanvas({
        scale: this.scale
      })
      .drawLayers()

    this.translateX = translateX
    this.translateY = translateY
  },
  ///增加大题目
  addOutSubject() {
    var data = this.currentData
    if (!!data) {
      data.isEdit = false;
      this.edit(data)

    }

    var timestamp = Date.parse(new Date());
    var centerPoint = this._getCenterPoint();
    var point = { x: centerPoint.x, y: centerPoint.y, width: 50, height: 50, groups: ["boxes-" + timestamp], name: "mybox-" + timestamp }
    data = {
      points: [
        point
      ],
      status: 0, isEdit: true, move: false, color: "#000", activePoint: point,
      child: []
    }
    this.edit(data)
    this.datas.push(data)

    this.currentData = data

  },
  ///增加小题目
  addSubSubject() {
    const data = this.currentData
    if (!!data && !!data.child) {
      this._addSmallQuestionBySuperData(data)
    } else if (!!data && data.activePoint.superName) {
      this._addSmallQuestionBySuperData(this._getDataByName(data.activePoint.superName))

    } else {
      // alert("选择一个大题框")
      throw "请选择一个题框"
    }
  },
  ///删除题目
  delSubject() {
    const data = this.currentData
    if (!!data) {
      var activePoint = data.activePoint
      $('canvas').removeLayerGroup(activePoint.groups[activePoint.groups.length - 1]).drawLayers();
      if (!!activePoint.superName) {
        var superData = this._getDataByName(activePoint.superName)
        ///小题
        var s = superData.child

        s.splice(s.indexOf(data), 1)
        this.edit(superData)
      } else {
        ///大题
        var s = this.datas
        s.splice(s.indexOf(data), 1)
      }
      this.currentData = null
    } else {
      throw "请选择要删除的题"
    }
  },
  edit(maindata) {
    var that = this;

    for (let index = 0; index < maindata.points.length; index++) {
      const data = maindata.points[index];
      var { x, y, width, height, groups, name } = data
      var { color } = maindata
      this.removeLayerGroup(data.groups[data.groups.length - 1]).drawLayers();

      this.drawRect({
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

          var data = that.currentData
          if (!!data) {
            data.isEdit = false;
            that.edit(data)
          }
          data = layer.data.data;
          data.activePoint = data.points[layer.data.index]
          data.isEdit = true;
          data.move = true;

          that.currentData = data

        },
      });

      ///绘制4个点
      if (maindata.isEdit == true) {
        // console.log(name);
        ///左上角
        this.drawArc({
          layer: true,
          groups: groups,
          fillStyle: 'gray',
          x: x - 6, y: y - 6,
          radius: 6,
          data: {
            data: maindata, index: index
          },
          mousedown: function (layer) {
            var data
            data = layer.data.data;
            data.activePoint = data.points[layer.data.index]
            data.direction = 1;
            that.currentData = data

          },
        });


        ///右上角
        this.drawArc({
          layer: true,
          groups: groups,
          fillStyle: 'gray',
          x: x + width - 6, y: y - 6,
          radius: 6,
          data: {
            data: maindata, index: index
          },
          mousedown: function (layer) {
            var data = layer.data.data;
            data.activePoint = data.points[layer.data.index]
            data.direction = 2;
            that.currentData = data

          },
        });

        ///左下角
        this.drawArc({
          layer: true,
          groups: groups,
          fillStyle: 'gray',
          x: x - 6, y: y + height - 6,
          radius: 6,
          data: {
            data: maindata, index: index
          },
          mousedown: function (layer) {
            var data = layer.data.data;
            data.activePoint = data.points[layer.data.index]
            data.direction = 3;
            that.currentData = data

          },
        });

        ///右下角
        this.drawArc({
          layer: true,
          groups: groups,
          fillStyle: 'gray',
          x: x + width - 6, y: y + height - 6,
          radius: 6,
          data: {
            data: maindata, index: index
          },
          mousedown: function (layer) {
            var data = layer.data.data;
            data.activePoint = data.points[layer.data.index]
            data.direction = 4;
            that.currentData = data

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
})


