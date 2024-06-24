<template>
  <div>
    <van-nav-bar
      title="FSR AI"
      left-text="戻す"
      left-arrow
      @click-left="$router.back()"
    />
    <van-tabbar v-model="active">
      <van-tabbar-item icon="home-o" replace :to="{ path: '/' }"
        >チャット</van-tabbar-item
      >
      <van-tabbar-item icon="search"  replace :to="{ path: '/about' }"
        >操作</van-tabbar-item
      >
    </van-tabbar>
    <router-view />
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

export default {
  setup() {
    const active = ref(0);
    const route = useRoute();

    watch(route, (newRoute) => {
      active.value = newRoute.path === "/about" ? 1 : 0;
    });

    onMounted(() => {
      active.value = route.path === "/about" ? 1 : 0;
    });

    return {
      active,
    };
  },
};
</script>

<style>
/* 添加一些基本样式 */
#app {
  text-align: center;
}
</style>
