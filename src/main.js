// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Cube from 'cube-ui'

import VueResource from 'vue-resource'
import jcanvas from 'jcanvas';


Vue.use(VueResource)
const url = process.env.NODE_ENV === 'production' ? 'http://124.222.126.3:2021/' : 'http://localhost:8080/'
Vue.http.options.root = url
Vue.http.options.emulateJSON = true

//下边代码添加在main.js中
Vue.http.interceptors.push((request, next) => {
if (typeof(request.body)==='object') {
  request.body = JSON.stringify(request.body)
}
  // continue to next interceptor
　　next((response) => {//在响应之后传给then之前对response进行修改和逻辑判断。对于token时候已过期的判断，就添加在此处，页面中任何一次http请求都会先调用此处方法
　return response;
 
  });
});

Vue.config.productionTip = false

Vue.use(Cube)

jcanvas($, window); 

import './base/base.js'
import './style/main.css'



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
