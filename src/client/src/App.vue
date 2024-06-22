<template>
  <ChatWindow
    ref="chatWindow"
    url="http://localhost:3000"
    @onMessage="onMessage"
    @onClickListCell="onClickListCell"
  />
</template>

<script>
import ChatWindow from "./components/ChatWindow.vue";
import TestData from "./js/testData.js";

let testData = new TestData();
export default {
  name: "App",
  components: {
    ChatWindow,
  },
  methods: {
    onClickListCell: async function (data) {
      //先弹Modal，显示详细信息
      try {
        const response = await this.$axios.post(
          "http://localhost:3000/model",
          data
        );
        console.log(response.data);
      } catch (error) {
        console.error("获取数据失败");
      }
    },
    //Logic これ
    onMessage(data) {
      //Test処理
      if (data.message == "#TEST#") {
        this.$refs.chatWindow.addMessage(testData.listMsg());
      } else {
        this.$refs.chatWindow.addMessage(data);
      }
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
