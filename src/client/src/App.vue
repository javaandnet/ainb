<template>
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
    <van-overlay :show="mode == 2">
      <div class="wrapper">
        <UploadFile
          @onClickClose="onClickCloseUploader"
          @onRemoveItem="onRemoveItemUploader"
          @onClickListCell="onClickListCellUploader"
          serverFolder="resume"
          :url="URL"
        ></UploadFile>
      </div>
    </van-overlay>
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
      URL: "http://160.16.216.251:8379/",
      //URL: "http://192.168.1.160:8379/",
      item: { items: [] },
      cmdList: {},
      mode: 0,
    };
  },
  methods: {
    loaded: async function () {},
    onClickCloseUploader: function () {
      this.mode = 0;
    },

    onRemoveItemUploader: function (item, cb) {
      let flg = false;
      cb(flg); //处理返回值，看看是否不删除
    },

    onClickLeftButtonInPM: async function () {
      const me = this;
      showConfirmDialog({
        message: "情報を送信してよろしいでしょうか？",
      })
        .then(async function () {
          let info = me.$refs.projectMatch.getInfo();
          if (info.sender.length == 0) {
            alert("送信情報を選択してください。");
            return;
          }
          if (info.worker.length == 0) {
            alert("技術者情報を選択してください。");
            return;
          }

          console.log("onClickLeftButtonInPM", info);
          me.setEnabled(false);
          const rtn = await me.$axios.post(me.URL + "confirmInfo", info);
          me.setEnabled(true);
          let content = rtn.data.out;
          if (rtn.statusText != "OK") {
            content = "エラー発生";
          }
          showDialog({
            title: rtn.statusText,
            message: content,
          }).then(() => {
            // on close
          });

          // console.log("confirmInfo", rtn);
        })
        .catch(() => {
          // on cancel
        });
    },
    setEnabled: function (flag) {
      this.$refs.projectMatch.setEnabled(flag);
    },
    onClickListCellUploader: async function (item) {},

    onClickRightButtonInPM: function () {
      this.mode = 0;
    },
    onCheckboxChangeInList: function (data) {
      console.log("onCheckboxChangeInList", data);
      this.item = data;
    },
    /**
     * 点击列表 右键
     */
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
        this.$refs.chatWindow.onSendMsg({ message: data.id });
        return;
      }
      // console.log(data);
      if (data.model == "project" || data.model == "worker") {
        //先弹Modal，显示详细信息
        try {
          const response = await this.$axios.post(this.URL + "model", data);
          let content = "";
          if (data.model == "project") {
            content = "<br><br>" + response.data.rtn;
          } else {
            // console.log(response.data);
            content = response.data.rtn;
          }
          showDialog({
            messageAlign: "left",
            allowHtml: true,
            title: data.text,
            message: content,
          }).then(() => {
            // on close
          });
          console.log(response.data);
        } catch (error) {
          console.error("获取数据失败");
        }
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
     *  一览时生成列表
     */
    createListInfoList(list, model) {
      return {
        mode: "list",
        model: model,
        list: list,
        isChecker: true,
        button: {
          right: { label: "宛先追加" },
        },
      };
    },
    /**
     *入力发送信息时, TODO chatWindow中处理
     */
    onSendMsg(message) {
      // console.log(message);
    },

    //サーバから情報戻す
    onMessage(message) {
      console.log("onMessage", message);
      let data = message;
      if (data.func == "listInfo") {
        let msg = {};
        if (data.args.type == "worker") {
          msg = this.createWorkerList(data.text.list);
        } else if (data.args.type == "project") {
          msg = this.createProjectList(data.text.list);
        } else {
          msg = this.createListInfoList(data.text.list, data.text.model);
        }
        this.$refs.chatWindow.addMessage(msg);
      } else if (data.func == "upload") {
        this.mode = "2";
      } else if (data.func == "sendInfo") {
        this.mode = "1";
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
