<template>
  <div>
    <!-- <ProjectMatch ref="userList" /> -->
    <div>
      <ChatWindow
        ref="chatWindow"
        url="http://localhost:3000"
        @onMessage="onMessage"
        @onClickListCell="onClickListCell"
        @onClickLeftButtonInList="onClickLeftButtonInList"
        @onClickRightButtonInList="onClickRightButtonInList"
        @onCheckboxChangeInList="onCheckboxChangeInList"
      />
    </div>
  </div>
</template>

<script>
import ProjectMatch from "../components/ProjectMatch.vue";
import ChatWindow from "../components/ChatWindow.vue";
import { showDialog } from "vant";
import TestData from "../js/testData.js";

let testData = new TestData();
export default {
  name: "App",
  components: {
    ChatWindow,
    ProjectMatch,
  },
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  data() {
    return {
      item: {},
    };
  },
  methods: {
    loaded: function () {},
    onCheckboxChangeInList: function (data) {
      this.item = data;
    },
    onClickRightButtonInList: async function (data) {
      this.item = data;
      // console.log(data);
    },
    onClickLeftButtonInList: async function (data) {
      this.item = data;
      // console.log(data);
    },
    onClickListCell: async function (data) {
      //先弹Modal，显示详细信息
      try {
        const response = await this.$axios.post(
          "http://localhost:3000/model",
          data
        );

        showDialog({
          messageAlign: "left",
          allowHtml: true,
          title: response.data.name,
          message:
            response.data.information +
            "<br><br><a href='" +
            response.data.resume +
            "' target='_blank'>履歴書Download</a>",
        }).then(() => {
          // on close
        });
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
