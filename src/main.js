import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.config.productionTip = false
Vue.use(VueAxios,axios);
Vue.use(VueGoogleMaps,{
  load:{
    key:'AIzaSyAmVjM34E5Jwh4EC9N4LbLvGUvK8LlsPGY',
    libraries: 'places',
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
