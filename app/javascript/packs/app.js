/* eslint no-console: 0 */
import Vue from 'vue/dist/vue.esm'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import  Modal from '../components/modal.vue'
Vue.use(VueMaterial) 

document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    el: '#app',
    data: { showModal: false },
    components: { Modal }
  })
})
