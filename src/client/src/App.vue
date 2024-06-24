<template>
  <div>
    <div>
      <ChatWindow
        ref="chatWindow"
        :url="URL"
        @onMessage="onMessage"
        @onSendMsg="onSendMsg"
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
import io from "socket.io-client";
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
    loaded: function () {
      this.socket = io(this.URL);
    },

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
    /**
     * 技術者リストを作成する
     */
    createWorkerList(list) {
      return {
        mode: "list",
        model: "worker",
        list: list,
        isChecker: true,
        button: {
          left: { label: "営業停止" },
          right: { label: "宛先追加" },
        },
      };
    },

    /**
     *入力发送信息时
     */
    onSendMsg(message) {
      console.log(message);
      let data = message.message;
      if (data.trim() == "") {
        return;
      }
      //Test処理
      if (data == "#TEST#") {
        this.$refs.chatWindow.addMessage(testData.listMsg());
      } else {
        //TODO
        //this.$refs.chatWindow.addMessage(data);
        this.$refs.chatWindow.sendMsg(this.getMsg(data));
        // this.socket.emit("message", this.getMsg(data));
      }
    },
    //入力时进行操作
    onMessage(message) {
      let data = message.message;
      const msg = this.createWorkerList(data);
      this.$refs.chatWindow.addMessage(msg);
    },
    getCmdList() {
      return {
        "#0#": {
          msg: "help",
          desc: "Help",
        },
        "#1#": {
          msg: "listInfo",
          args: { type: "worker" },
          desc: "技術者一覧",
        },
        "#8#": {
          msg: "sendInfo",
          desc: "情報発送",
        },
      };
    },
    getMsg(key, args) {
      var cmd = this.getCmdList()[key];
      if (key != "#0#") {
        return {
          threadId: this.thread,
          content: cmd.msg,
          args: args || cmd.args,
          option: "server",
        };
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
