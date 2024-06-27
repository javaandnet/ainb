<template>
  <div>
    <ChatWindow
      v-if="mode == 0"
      ref="chatWindow"
      :url="URL"
      @onMessage="onMessage"
      @onSendMsg="onSendMsg"
      @onClickListCell="onClickListCell"
      @onClickLeftButtonInList="onClickLeftButtonInList"
      @onClickRightButtonInList="onClickRightButtonInList"
      @onCheckboxChangeInList="onCheckboxChangeInList"
    />

    <van-overlay :show="mode == 1">
      <div class="wrapper">
        <ProjectMatch
          ref="projectMatch"
          @onClickLeftButton="onClickLeftButtonInPM"
          @onClickRightButton="onClickRightButtonInPM"
          @loaded="onLoadedPM"
        />
      </div>
    </van-overlay>
    <UploadFile
      v-if="mode == 2"
      @onClickClose="onClickCloseUploader"
      @onRemoveItem="onRemoveItemUploader"
      @onClickListCell="onClickListCellUploader"
      serverFolder="resume"
      :url="URL"
    ></UploadFile>
  </div>
</template>

<script>
import ProjectMatch from "./components/ProjectMatch.vue";
import ChatWindow from "./components/ChatWindow.vue";
import UploadFile from "./components/UploadFile.vue";
import { showDialog } from "vant";
import { Overlay } from "vant";
import { showConfirmDialog } from "vant";
import TestData from "./js/testData.js";
let testData = new TestData();

testData.listMsg();
export default {
  name: "App",
  components: {
    VantOverlay: Overlay,
    ChatWindow,
    ProjectMatch,
    UploadFile,
  },

  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  data() {
    return {
      //URL: "http://160.16.216.251:8379/",
      URL: "http://192.168.1.160:8379/",
      item: { items: [] },
      cmdList: {},
      mode: 2,
    };
  },
  methods: {
    loaded: async function () {
      // var me = this;
      // this.socket = io(this.URL);
      // let rtn = await me.$axios.post(me.URL + "cmd");
      // this.cmdList = rtn.data;
    },
    onClickCloseUploader: function () {
      this.mode = 0;
    },

    onRemoveItemUploader: function (item, cb) {
      let flg = false;
      cb(flg); //处理返回值，看看是否不删除
    },

    onClickLeftButtonInPM: async function () {
      let info = this.$refs.projectMatch.getInfo();
      console.log(info);
      await this.$axios.post(this.URL + "confirmInfo", info);
    },

    onClickListCellUploader: async function (item) {

    },

    onClickRightButtonInPM: function () {
      this.mode = 0;
    },
    onCheckboxChangeInList: function (data) {
      this.item = data;
    },
    onClickRightButtonInList: async function (data) {
      this.mode = 1;
      this.item = data;
      if (this.$refs.projectMatch) {
        this.$refs.projectMatch.sync(this.item);
      }
    },
    onClickLeftButtonInList: async function (data) {
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
      if (data.model == "cmd") {
        console.log(data);
        this.$refs.chatWindow.onSendMsg({ message: data.id });
        return;
      }
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

    /**
     *入力发送信息时, TODO chatWindow中处理
     */
    onSendMsg(message) {
      console.log(message);
    },

    //サーバから情報戻す
    onMessage(message) {
      console.log(message);
      let data = message;
      if (data.func == "listInfo") {
        if (data.args.type == "worker") {
          const msg = this.createWorkerList(data.text);
          this.$refs.chatWindow.addMessage(msg);
        } else if (data.args.type == "project") {
          const msg = this.createProjectList(data.text);
          this.$refs.chatWindow.addMessage(msg);
        }
      } else if (data.func == "upload") {
        this.mode = "2";
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
