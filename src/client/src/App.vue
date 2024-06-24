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
    <van-overlay :show="show" @click="show = false">
      <div class="wrapper">
        <ProjectMatch
          ref="userList"
          @onClickLeftButton="onClickLeftButtonInPM"
          @onClickRightButton="onClickRightButtonInPM"
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
    },
    onClickLeftButtonInList: async function (data) {
      console.log(data);
      const me = this;
      showConfirmDialog({
        message: "選択したものを営業停止してよろしいでしょうか？",
      })
        .then(async function () {
          const response = await me.$axios.post(me.URL + "stop", {
            model: data.model,
            ids: data.ids.items,
            status: 0,
          });
          console.log(response.data);
        })
        .catch(() => {
          // on cancel
        });
    },
    onClickListCell: async function (data) {
      //先弹Modal，显示详细信息
      try {
        const response = await this.$axios.post(this.URL + "model", data);
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
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #fff;
}
</style>
