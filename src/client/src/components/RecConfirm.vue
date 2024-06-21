<template>
  <div  class="wrapper" >
 
    <van-popup v-model:show="show"  ><Rec/>      </van-popup>

  </div>
  
</template>
<style>
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
      background-color: rgba(255, 255, 255, 0.5);
  }
  </style>
<script>
import { Dialog, Button } from "vant";
import "vant/lib/index.css";
import Rec from './Rec.vue';

export default {
  components: {
    VanDialog: Dialog,
    VanButton: Button,
    Rec:Rec
  },
  data() {
    return {
      show: true,
    };
  },
  methods: {
    showDialog() {
      this.show = true;
    },
  },
};
</script>
