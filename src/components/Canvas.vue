<template>
    <div>
        <canvas :width="canvasWidth" :height="canvasHeight" id="myCanvas" style="border:1px solid #d3d3d3;margin-top: 20px;/*  */"></canvas>
        <img id="scream" src="/static/image2.jpg" style="display: none;">
    </div>
</template>

<script>

var img

var translateY = 0
var scale = 1

var x = 0;
var y = 0;

export default {
    name: "Canvas",
    data() {
        return {
            canvasWidth: 1000,
            canvasHeight: 800,
        }
    },
    mounted() {
        var that = this
        this.$nextTick(function () {
            img = document.getElementById("scream");
            img.onload = function () {
                that.draw()

                $("#myCanvas").mouseup(function (e) {

                    const { left, top } = document.getElementById('myCanvas').getBoundingClientRect()
                    const { clientX, clientY } = e;

                    var realX = clientX - left;
                    var realY = clientY - top;

                    realY -= translateY;

                    realX /= scale
                    realY /= scale

                    console.log("x:", realX, "----y:", realY);

                    ///移动到对应点
                    // that.clearCanvas()
                    // x = realX
                    // y = realY
                    // that.draw()
                });
            }





        })
    },
    methods: {
        draw() {
            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");

            // 保存当前渲染上下文所进行的变换
            ctx.save();
            // ctx.translate(0, translateY)

            // ctx.scale(scale,scale)

            // ctx.rotate(Math.PI/4)

            ///https://www.w3schools.com/tags/canvas_transform.asp
            ctx.transform(scale, 0, 0, scale, 0, translateY);

            // ctx.fillStyle = "blue";
            // ctx.fillRect(x, y, 300, 100);

            ctx.drawImage(img,x,y,260,180);

            // 恢复先前渲染上下文所进行的变换
            ctx.restore();
        },
        clearCanvas() {
            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");
            // 保存当前渲染上下文所进行的变换
            ctx.save();

            // 重置渲染上下文并清空画布
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, c.width, c.height);

            // 恢复先前渲染上下文所进行的变换
            ctx.restore();
        }
    },
}
</script>

<style scoped>

</style>