///拖动背景框
var DragBgModel = {
    isDragBg: false,

    mousedown(e, canvas) {
        return !!this.isDragBg
    },
    mousemove(e, canvas) {
        const gX = canvas.gX;
        const gY = canvas.gY;
        if (!!this.isDragBg) {
            ///拖动bg
            var cx = e.clientX - canvas.canvasLeft;
            var cy = e.clientY - canvas.canvasTop;

            canvas.translate(canvas.translateX - (gX - cx), canvas.translateY - (gY - cy))
            return true
        }

        return false
    },
    mouseup(e, canvas) {
        this.isDragBg = false
        return false
    },

}

///移动题目
var MoveModel = {
    isMove: false,
    mousedown(e, canvas) {
        return !!this.isMove
    },
    mousemove(e, canvas) {
        const data = canvas.currentData;
        const activePoint = data.activePoint
        if (!!data) {
            const scale = canvas.scale
            var gX = canvas.gX;
            var gY = canvas.gY;
            var canvasLeft = canvas.canvasLeft;
            var canvasTop = canvas.canvasTop;

            var cx = e.clientX - canvasLeft;
            var cy = e.clientY - canvasTop;
            ///转成坐标轴上的坐标
            gX /= scale;
            gY /= scale;
            cx /= scale;
            cy /= scale;

            if (!!this.isMove) {
                ///移动
                activePoint.y += cy - gY;
                activePoint.x += cx - gX;

                if (!!canvas.togetherMove) {
                    ///带着孩子一起移动
                    var group = activePoint.groups[activePoint.groups.length - 1]
                    var xx = cx - gX
                    var yy = cy - gY
                    canvas.setLayerGroup(group, {
                        x: '+=' + xx,
                        y: '+=' + yy
                    }).drawLayers()
                    return;
                }

                canvas.edit(data)
                return true
            }
        }

        return false
    },
    mouseup(e, canvas) {
        const data = canvas.currentData;

        if (!!this.isMove && !!canvas.togetherMove && !!data) {
            const activePoint = data.activePoint
            ///进过移动后,重新给child的数据模型赋值x、y
            var group = activePoint.groups[activePoint.groups.length - 1]

            var array = canvas.getLayerGroup(group)

            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (!!element.name) {
                    ///有名字才有模型
                    element.data.data.points[element.data.index].x = element.x;
                    element.data.data.points[element.data.index].y = element.y;
                }

            }

            canvas.edit(data)


        }
        this.isMove = false


        return false
    },
}

///拖动点
var MovePointModel = {
    direction: 0,
    tempQuadrant: [],
    mousedown(e, canvas) {
        const data = canvas.currentData;
        const direction = this.direction
        if (!!data && direction > 0) {
            if (!data.superName && !!canvas.collisionCheck) {
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
                var list = canvas.datas
                var quadrant = {
                    immobilityPoint: null,
                    quadrantPoints: [[], [], [], []],

                };
                this.tempQuadrant = quadrant

                if (direction == 1) {
                    ///左上角
                    immobilityPoint = { x: activePoint.x + activePoint.width, y: activePoint.y + activePoint.height }
                } else if (direction == 2) {
                    ///右上角
                    immobilityPoint = { x: activePoint.x, y: activePoint.y + activePoint.height }
                } else if (direction == 3) {
                    ///左下角
                    immobilityPoint = { x: activePoint.x + activePoint.width, y: activePoint.y }
                } else if (direction == 4) {
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
            return true
        }
        return false
    },
    mousemove(e, canvas) {
        const data = canvas.currentData;
        const activePoint = data.activePoint
        const direction = this.direction
        if (!!data && direction > 0) {
            const scale = canvas.scale
            var gX = canvas.gX;
            var gY = canvas.gY;
            var canvasLeft = canvas.canvasLeft;
            var canvasTop = canvas.canvasTop;

            var cx = e.clientX - canvasLeft;
            var cy = e.clientY - canvasTop;
            ///转成坐标轴上的坐标
            gX /= scale;
            gY /= scale;
            cx /= scale;
            cy /= scale;



            const oldData = canvas._tempData(data)
            ///正在点击的点
            var clickPoint;
            if (direction == 2) {
                ///右上角
                activePoint.width += cx - gX;
                activePoint.y += cy - gY;
                activePoint.height += gY - cy;
                clickPoint = { x: activePoint.x + activePoint.width, y: activePoint.y }
            } else if (direction == 1) {
                ///左上角
                activePoint.x += cx - gX;
                activePoint.width += gX - cx;
                activePoint.y += cy - gY;
                activePoint.height += gY - cy;
                clickPoint = { x: activePoint.x, y: activePoint.y }
            } else if (direction == 3) {
                ///左下角
                activePoint.height += cy - gY;
                activePoint.x += cx - gX;
                activePoint.width += gX - cx;
                clickPoint = { x: activePoint.x, y: activePoint.y + activePoint.height }
            } else if (direction == 4) {
                ///右下角
                activePoint.height += cy - gY;
                activePoint.width += cx - gX;
                clickPoint = { x: activePoint.x + activePoint.width, y: activePoint.y + activePoint.height }
            }

            if (!!activePoint.superName) {
                ///不超过父视图
                var point = clickPoint
                if (!canvas._pointInRect(point, canvas.getLayer(activePoint.superName))) {
                    ///不在矩形内 activePoint进行还原
                    activePoint.x = oldData.x
                    activePoint.y = oldData.y
                    activePoint.width = oldData.width
                    activePoint.height = oldData.height
                }

            } else {
                var quadrant = this.tempQuadrant
                if (!!canvas.collisionCheck && !!quadrant) {
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
                        ///如果两个rect本来就相交的就不检测碰撞 canvas._checkIntersect(oldData, otherRect)
                        iscollision = !canvas._checkIntersect(oldData, otherRect) && canvas._checkIntersect(activePoint, otherRect)
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

            canvas.edit(data)

            return true
        }

        return false
    },
    mouseup(e, canvas) {
        const data = canvas.currentData;
        if (this.direction > 0) {
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

            canvas.edit(data)

            this.tempQuadrant = null
            this.direction = 0
        }

        return false
    },
}

module.exports = {
    DragBgModel,
    MoveModel,
    MovePointModel
}