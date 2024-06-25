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
      cmdList: {},
      show: false,
    };
  },
  methods: {
    loaded: async function () {
      var me = this;
      this.socket = io(this.URL);
      let rtn = await me.$axios.post(me.URL + "cmd");
      this.cmdList = rtn.data;
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
        let content = "";
        if (data.model == "project") {
          content = "<br><br>" + response.data.detail;
        } else {
          content =
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
        }
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
     * 技術者リストを作成する
     */
    createProjectList(list) {
      return {
        mode: "list",
        model: "project",
        list: list,
        isChecker: true,
        button: {
          left: { label: "営業停止" },
          right: { label: "宛先追加" },
        },
      };
    },
    createCmdList() {
      return {
        mode: "list",
        model: "cmd",
        list: this.getCmdList(),
        isDelete: false,
        button: {},
      };
    },
    /**
     *入力发送信息时, TODO chatWindow中处理
     */
    onSendMsg(message) {
      console.log(message);
      let data = message.message;
      let info = "";
      let cmdKey = data;
      if (data.trim() == "") {
        return;
      }
      //首文字开始
      for (let key of Object.keys(this.cmdList)) {
        if (data.indexOf(key) == 0) {
          cmdKey = key;
          info = data.replace(key, "");
          break;
        }
      }
      const msg = this.getMsg(cmdKey);
      //Test処理
      if (cmdKey == "#TEST#") {
        this.$refs.chatWindow.addMessage(testData.listMsg());
      } else if (msg.option == "server") {
        this.addTransKeyInfo(cmdKey);
        if (cmdKey == "#0#") {
          //Need not to send
          this.$refs.chatWindow.addMessage(this.createCmdList());
        } else {
          msg.args.info = info;
          this.$refs.chatWindow.sendMsg(msg);
        }
      }
    },

    addTransKeyInfo(key) {
      this.$refs.chatWindow.addMessage({
        mode: "text",
        message: { text: this.cmdList[key].desc },
      });
    },

    //サーバから情報戻す
    onMessage(message) {
      console.log(message);
      let data = message;
      if (data.func == "listInfo") {
        if (data.args.type == "worker") {
          const msg = this.createWorkerList(data.rtn);
          this.$refs.chatWindow.addMessage(msg);
        } else if (data.args.type == "project") {
          const msg = this.createProjectList(data.rtn);
          this.$refs.chatWindow.addMessage(msg);
        }
      }
    },
    getCmdList() {
      //TODO 服务器初始化定义
      let rtn = [];
      for (const ele of Object.keys(this.cmdList)) {
        rtn.push({ value: ele, text: ele + ":" + this.cmdList[ele].desc });
      }
      return rtn;
    },
    getMsg(key, args) {
      var cmd = this.cmdList[key];
      if (key == "#0#") {
        //输出帮助信息
      } else {
        if (key) {
          return {
            threadId: this.thread,
            text: cmd.msg,
            args: args || cmd.args,
            option: "server",
          };
        } else {
          return { threadId: this.thread, content: key };
        }
        // this.$refs.chatWindow.addMessage(msg);
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
