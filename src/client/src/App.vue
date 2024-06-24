<template>
  <div>
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
    <van-overlay :show="show">
      <div class="wrapper">
        <ProjectMatch
          ref="projectMatch"
          @onClickLeftButton="onClickLeftButtonInPM"
          @onClickRightButton="onClickRightButtonInPM"
          @loaded="onLoadedPM"
        />
      </div>
    </van-overlay>
  </div>
</template>

<script>
import ProjectMatch from "./components/ProjectMatch.vue";
import ChatWindow from "./components/ChatWindow.vue";
import { showDialog } from "vant";
import { Overlay } from "vant";
import TestData from "./js/testData.js";
import { showConfirmDialog } from "vant";

let testData = new TestData();
export default {
  name: "App",
  components: {
    VantOverlay: Overlay,
    ChatWindow,
    ProjectMatch,
  },

  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  data() {
    return {
      URL: "http://localhost:3000/",
      item: {},
      show: false,
    };
  },
  methods: {
    loaded: function () {},

    onClickLeftButtonInPM: function () {
      // this.item = data;
    },
    onClickRightButtonInPM: function () {
      this.show = false;
    },
    onCheckboxChangeInList: function (data) {
      this.item = data;
    },
    onClickRightButtonInList: async function (data) {
      this.show = true;
      console.log(this.item);
      this.item = data;
      if (this.$refs.projectMatch) {
        this.$refs.projectMatch.sync(this.item);
      }
    },
    onClickLeftButtonInList: async function (data) {
      console.log(data);
      const me = this;
      showConfirmDialog({
        message: "選択したものを営業停止してよろしいでしょうか？",
      })
        .then(async function () {
          await me.$axios.post(me.URL + "stop", {
            model: data.model,
            ids: data.items,
            status: 0,
          });
          // console.log(response.data);
        })
        .catch(() => {
          // on cancel
        });
    },
    onLoadedPM: function () {
      this.$refs.projectMatch.sync(this.item);
    },
    onClickListCell: async function (data) {
      //先弹Modal，显示详细信息
      try {
        const response = await this.$axios.post(this.URL + "model", data);
        let content =
          // response.data.status +
          // "<br><br>" +
          // response.data.skill +
          // "<br><br>" +
          // response.data.japanese +
          "<br><br>" +
          response.data.information +
          "<br><br><a href='" +
          response.data.resume +
          "' target='_blank'>履歴書Download</a>";
        showDialog({
          messageAlign: "left",
          allowHtml: true,
          title: response.data.name,
          message: content,
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
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #fff;
}
</style>
