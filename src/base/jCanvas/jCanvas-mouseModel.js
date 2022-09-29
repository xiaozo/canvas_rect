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
    collisionCheck:false,
    _tempXs: null,
    _tempYs: null,
    _xIndex: -1,
    _yIndex: -1,
    _tempCollisionRects: null,
    _checkIntersect(rect1, rect2, type) {
        if (type == 0) {
            ///x
            if (rect2.x + rect2.width < rect1.x ||
                rect1.x + rect1.width < rect2.x) {
                return false
            }
        } else {
            ///y
            if (rect1.y + rect1.height < rect2.y ||
                rect2.y + rect2.height < rect1.y) {
                return false
            }
        }
        return true
    },
    ///0:上   1：左    2：下     3：右
    _directionRect(rect, targetRect) {
        if (targetRect.y + targetRect.height <= rect.y) {
            return 0
        } else if (rect.y + rect.height <= targetRect.y) {
            return 2
        } else if (targetRect.x + targetRect.width <= rect.x) {
            return 1
        } else {
            return 3
        }
    },
    _pushCollisionRect(list, rect, direction) {
        if (list.indexOf(rect) == -1) {
            const { x, y, width, height } = rect
            let i = 0;
            if (direction == 0 || direction == 2) {
                ///上方或者下方
                while (i < list.length) {
                    const element = list[i];
                    if (
                        x >= element.x && x + width <= element.x + element.width &&
                        (
                            (element.y > y && direction == 0) ||
                            (element.y < y && direction == 2)
                        )
                    ) {
                        return
                    }
                    if (element.x > x) {
                        i--;
                        break
                    }
                    i++;
                }
                i = Math.max(0, i)
                list.splice(i, 0, rect); i++;

                while (i < list.length) {
                    const element = list[i];
                    ////去除后面包裹在rect里的
                    if (x <= element.x && x + width >= element.x + element.width &&
                        (
                            (element.y < y && direction == 0) ||
                            (element.y > y && direction == 2)
                        )
                    ) {
                        list.splice(i, 1)
                        continue
                    }
                    i++;
                }

            } else {
                ///向左或者向右
                while (i < list.length) {
                    const element = list[i];
                    if (
                        y >= element.y && y + height <= element.y + element.height &&
                        (
                            (element.x > x && direction == 1) ||
                            (element.x < x && direction == 3)
                        )
                    ) {
                        return
                    }
                    if (element.y > y) {
                        i--;
                        break
                    }
                    i++;
                }

                i = Math.max(0, i)
                list.splice(i, 0, rect); i++;

                while (i < list.length) {
                    const element = list[i];
                    if (y <= element.y && y + height >= element.y + element.height &&
                        (
                            (element.x < x && direction == 1) ||
                            (element.x > x && direction == 3)
                        )
                    ) {
                        list.splice(i, 1)
                        continue
                    }
                    i++;
                }
            }
        }

    },
    mousedown(e, canvas) {
        var that = this
        if (!!this.collisionCheck) {
            if (!!this.isMove) {
                this._tempXs = []
                this._tempYs = []
                this._tempCollisionRects = [[], [], [], []]
                const { datas, currentData } = canvas
                const activePoint = currentData.activePoint

                datas.forEach(data => {
                    if (data != currentData) {
                        data.points.forEach(point => {
                            if (that._checkIntersect(activePoint, point, 0) || that._checkIntersect(activePoint, point, 1)) {
                                var direction = that._directionRect(activePoint, point)
                                var list = that._tempCollisionRects[direction]
                                that._pushCollisionRect(list, point, direction)
                            }

                            that._tempXs.push({
                                v: point.x,
                                from: point
                            })

                            that._tempXs.push({
                                v: point.x + point.width,
                                from: point
                            })

                            that._tempYs.push({
                                v: point.y,
                                from: point
                            })

                            that._tempYs.push({
                                v: point.y + point.height,
                                from: point
                            })


                        });
                    }

                });
                this._tempXs.sort(function (obj1, obj2) {
                    return obj1.v - obj2.v
                })
                this._tempYs.sort(function (obj1, obj2) {
                    return obj1.v - obj2.v
                })

                // console.log(that._tempCollisionRects);

            }
        }

        return !!this.isMove
    },
    mousemove(e, canvas) {
        const data = canvas.currentData
        if (!!data) {
            const activePoint = data.activePoint
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
                var iscollision = false
                const that = this
                if (!!this.collisionCheck) {
                    if (!!this._tempXs.length) {
                        if (cx - gX > 0) {
                            ///向右
                            let index = this._xIndex == -1 ? 0 : this._xIndex
                            for (index; index < this._tempXs.length; index++) {
                                var newData = canvas._tempData(data)
                                const element = this._tempXs[index];
                                if (element.v > newData.x + newData.width) {
                                    newData.x += cx - gX;
                                    if (!!this._checkIntersect(newData, { x: element.v, y: 0, width: 0, height: 0 }, 0)) {
                                        var direction = this._directionRect(newData, element.from)
                                        var list = this._tempCollisionRects[direction]
                                        this._pushCollisionRect(list, element.from, direction)

                                    } else {
                                        break
                                    }

                                }
                            }
                            this._xIndex = index

                        } else if (cx - gX < 0) {
                            ///向左
                            let index = this._xIndex == -1 ? 0 : this._tempXs.length - 1
                            for (index; index >= 0; index--) {
                                var newData = canvas._tempData(data)
                                const element = this._tempXs[index];
                                if (element.v < newData.x) {
                                    newData.x += cx - gX;
                                    if (!!this._checkIntersect(newData, { x: element.v, y: 0, width: 0, height: 0 }, 0)) {
                                        var direction = this._directionRect(newData, element.from)
                                        var list = this._tempCollisionRects[direction]
                                        this._pushCollisionRect(list, element.from, direction)
                                    } else {
                                        break
                                    }

                                }
                            }
                            this._xIndex = index

                        }
                    }


                    if (!!this._tempYs.length) {
                        if (cy - gY > 0) {
                            ///向下
                            let index = this._yIndex == -1 ? 0 : this._yIndex
                            for (index; index < this._tempYs.length; index++) {
                                var newData = canvas._tempData(data)
                                const element = this._tempYs[index];
                                if (element.v > newData.y + newData.height) {
                                    newData.y += cy - gY;
                                    if (!!this._checkIntersect(newData, { x: 0, y: element.v, width: 0, height: 0 }, 1)) {
                                        var direction = this._directionRect(newData, element.from)
                                        var list = this._tempCollisionRects[direction]
                                        this._pushCollisionRect(list, element.from, direction)
                                    } else {
                                        break
                                    }

                                }
                            }
                            this._yIndex = index

                        } else if (cy - gY < 0) {
                            ///向上
                            let index = this._yIndex == -1 ? 0 : this._tempYs.length - 1
                            for (index; index >= 0; index--) {
                                var newData = canvas._tempData(data)
                                const element = this._tempYs[index];
                                if (element.v < newData.y) {
                                    newData.y += cy - gY;
                                    if (!!this._checkIntersect(newData, { x: 0, y: element.v, width: 0, height: 0 }, 1)) {
                                        var direction = this._directionRect(newData, element.from)
                                        var list = this._tempCollisionRects[direction]
                                        this._pushCollisionRect(list, element.from, direction)
                                    } else {
                                        break
                                    }

                                }
                            }
                            this._yIndex = index
                        }
                    }


                    var newData = canvas._tempData(data)
                    newData.y += cy - gY;
                    newData.x += cx - gX;

                    let removeCollisionRectsBlock = function (list) {
                        let index = 0
                        while (index < list.length) {
                            const point = list[index]
                            if (!that._checkIntersect(newData, point, 0) && !that._checkIntersect(newData, point, 1)) {
                                list.splice(index, 1)

                            } else {

                                if (!iscollision && !!canvas._checkIntersect(point, newData) && !canvas._checkIntersect(point, activePoint)) {
                                    iscollision = true

                                }

                                index++;

                            }
                        }
                    }

                    this._tempCollisionRects.forEach(list => {
                        removeCollisionRectsBlock(list)
                    });



                    // console.log(this._tempCollisionRects, this._xIndex, this._yIndex);
                }



                if (!iscollision) {
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
                }


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
        this._tempXs = null
        this._tempYs = null
        this._tempCollisions = null
        this._xIndex = -1
        this._yIndex = -1

        return false
    },
}

///拖动点
var MovePointModel = {
    direction: 0,
    _tempQuadrant: [],
    minRect: null,
    maxRect: null,
    mousedown(e, canvas) {
        const data = canvas.currentData;
        const direction = this.direction
        if (!!data && direction > 0) {
            // console.log(canvas._getSuperChildsByData(data),data);
            if (!!canvas.collisionCheck) {
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
                var list = canvas._getSuperChildsByData(data)
                var quadrant = {
                    immobilityPoint: null,
                    quadrantPoints: [[], [], [], []],

                };
                this._tempQuadrant = quadrant

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
                            if (rect.superName === activePoint.superName) {
                                ///只加入同个父类的
                                quadrantClassifyBlock(immobilityPoint, rect, quadrant.quadrantPoints)
                            }


                        }
                    }

                }
                ///quadrantPoints进行距离近的排序
                for (let index = 0; index < quadrant.quadrantPoints.length; index++) {
                    const quadrantPoints = quadrant.quadrantPoints[index];
                    if (quadrantPoints.length > 4) {
                        quadrantPoints.sort(function (rect1, rect2) {
                            return canvas._minDistanceOfRectangles({ x: immobilityPoint.x, y: immobilityPoint.y, width: 1, height: 1 }, rect1)
                                - canvas._minDistanceOfRectangles({ x: immobilityPoint.x, y: immobilityPoint.y, width: 1, height: 1 }, rect2)
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

        const direction = this.direction
        if (!!data && direction > 0) {
            const activePoint = data.activePoint
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



            ///保存变换前的rect
            const oldData = canvas._tempData(data)
            ///保存变换前点击的点
            var oldClickDataPoint = null
            ///正在点击的点
            var clickPoint;
            if (direction == 2) {
                ///右上角
                activePoint.width += cx - gX;
                activePoint.y += cy - gY;
                activePoint.height += gY - cy;
                clickPoint = { x: activePoint.x + activePoint.width, y: activePoint.y }
                oldClickDataPoint = { x: oldData.x + oldData.width, y: oldData.y }
            } else if (direction == 1) {
                ///左上角
                activePoint.x += cx - gX;
                activePoint.width += gX - cx;
                activePoint.y += cy - gY;
                activePoint.height += gY - cy;
                clickPoint = { x: activePoint.x, y: activePoint.y }
                oldClickDataPoint = { x: oldData.x, y: oldData.y }
            } else if (direction == 3) {
                ///左下角
                activePoint.height += cy - gY;
                activePoint.x += cx - gX;
                activePoint.width += gX - cx;
                clickPoint = { x: activePoint.x, y: activePoint.y + activePoint.height }
                oldClickDataPoint = { x: oldData.x, y: oldData.y + oldData.height }
            } else if (direction == 4) {
                ///右下角
                activePoint.height += cy - gY;
                activePoint.width += cx - gX;
                clickPoint = { x: activePoint.x + activePoint.width, y: activePoint.y + activePoint.height }
                oldClickDataPoint = { x: oldData.x + oldData.width, y: oldData.y + oldData.height }
            }

            const collisionBlock = function (minRect, maxRect, quadrant) {
                if (!!canvas.collisionCheck) {
                    if (!!maxRect) {
                        ///不超过父视图
                        var point = clickPoint
                        if (!canvas._pointInRect(point, maxRect) && canvas._pointInRect(oldClickDataPoint, maxRect)) {
                            ///超过父视图 activePoint进行还原
                            activePoint.x = oldData.x
                            activePoint.y = oldData.y
                            activePoint.width = oldData.width
                            activePoint.height = oldData.height
                            return
                        }

                    }

                    if (!!minRect) {
                        ///不允许在子视图内
                        var point = clickPoint
                        if (
                            (activePoint.x > minRect.x ||
                                activePoint.y > minRect.y ||
                                activePoint.y + activePoint.height < minRect.y + minRect.height ||
                                activePoint.x + activePoint.width < minRect.x + minRect.width)
                            &&
                            (oldData.x < minRect.x &&
                                oldData.y < minRect.y &&
                                oldData.y + oldData.height > minRect.y + minRect.height &&
                                oldData.x + oldData.width > minRect.x + minRect.width) ///minRect完全在变化前的rect里
                        ) {
                            ///在子视图内 activePoint进行还原
                            activePoint.x = oldData.x
                            activePoint.y = oldData.y
                            activePoint.width = oldData.width
                            activePoint.height = oldData.height
                            return
                        }
                    }

                    if (!!quadrant) {
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
            }

            collisionBlock(this.minRect, this.maxRect, this._tempQuadrant);

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

            this._tempQuadrant = null
            this.maxRect = null
            this.minRect = null
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