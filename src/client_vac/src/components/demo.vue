<template>
  <div class="itxst">
    {{ title }}
  </div>
</template>
<script>
//选项式默认当前实例是全部暴露
export default {
  name: "demo",
  //默认全部暴露 也可以通过expose控制那些需要暴露
  //expose: ['play'],
  data() {
    return {
      title: "www.itxst.com",
    };
  },
  methods: {
    play: function () {
      this.title = "你调用了子组件的方法";
    },
  },
};
</script>