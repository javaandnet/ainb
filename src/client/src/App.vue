<template>
  <div>
    <van-empty description="FSR.CO.JP" />
    <van-button type="primary" size="large" @click="say('hello')"
      >大号按钮</van-button
    >
  </div>
</template>

<script>
import io2 from "socket.io-client";

export default {
  data() {
    return {
      messages: [],
      // 1) サーバ連結
  
    };
  },
  methods: {
    say() {
      var socket = io2("http://localhost:3001", {
    withCredentials: true
  });
      socket.connect();
    },
    chat() {},
  },
};
</script>

<style>
body {
  font-size: 16px;
  background-color: #f8f8f8;
  -webkit-font-smoothing: antialiased;
}
</style>
