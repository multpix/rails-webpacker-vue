/* eslint no-console: 0 */
import Vue from 'vue/dist/vue.esm'
import  Modal from '../components/modal.vue'
document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    el: '#app',
    data: { showModal: false },
    components: { Modal }
  })
})
