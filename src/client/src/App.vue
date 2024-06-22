<template>
  <ChatWindow
    ref="chatWindow"
    url="http://localhost:3000"
    @onMessage="onMessage"
  />
</template>

<script>
import ChatWindow from "./components/ChatWindow.vue";

export default {
  name: "App",
  components: {
    ChatWindow,
  },
  methods: {
    //Logic これ
    onMessage(data) {
      //Test処理
      if (data.message == "#TEST#") {
        console.log(111);
      }
      this.$refs.chatWindow.addMessage(data);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
