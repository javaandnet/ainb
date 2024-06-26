<template>
  <div style="padding: 5px">
    <div>
      <List
        ref="list"
        @onClickListCell="onClickListCell"
        @onClickRightButtonInList="onClickRightButtonInList"
        @onClickLeftButtonInList="onClickLeftButtonInList"
        @onCheckboxChangeInList="$emit('onCheckboxChangeInList', $event)"
      />
    </div>
    <div>
      <InputMessage
        ref="input"
        @sendMsg="onSendMsg"
        @recording="recording"
        @stopRecord="stopRecord"
        @startRecord="startRecord"
      />
    </div>
  </div>
</template>

<script>
import InputMessage from "./InputMessage.vue";
import List from "./List.vue";
import io from "socket.io-client";
import TestData from "../js/testData.js";
let testData = new TestData();
export default {
  name: "App",
  components: {
    InputMessage,
    List,
  },
  emits: [
    "onMessage",
    "onSendMsg",
    "onClickListCell",
    "onClickLeftButtonInList",
    "onClickRightButtonInList",
    "onCheckboxChangeInList",
  ],
  props: {
    userId: { type: String, default: "9999" },
    url: { type: String, default: "" },
  },
  data() {
    return {
      cmdList: {},
      threadId: "",
    };
  },
  mounted() {
    this.socket = io(this.url);
    // 组件挂载后调用的方法
    this.loaded();
  },

  methods: {
    onClickLeftButtonInList(obj) {
      this.$emit("onClickLeftButtonInList", obj);
    },
    onClickRightButtonInList(obj) {
      this.$emit("onClickRightButtonInList", obj);
    },
    startRecord() {
      this.socket.emit("startRecord", {
        threadId: this.thread,
      });
    },
    onClickListCell(obj) {
      this.$emit("onClickListCell", obj);
    },
    stopRecord() {
      this.socket.emit(
        "stopRecord",
        {
          threadId: this.thread,
        },
        (res) => {
          console.log(res);
        }
      );
    },
    recording(data) {
      this.socket.emit("recording", {
        threadId: this.thread,
        data: data.data.buffer,
      });
    },

    addMessage(message) {
      //Default
      if (typeof message == "string") {
        this.$refs.list.addMessage({
          mode: "text",
          text: message,
          userId: this.userId,
        });
      } else {
        if (message.mode && message.mode == "list") {
          //Listに追加する
          // console.log("list:", message);
          if (typeof message.userId == "undefined") {
            message.userId = this.thread;
          }
          this.$refs.list.addMessage(message);
        } else {
          const msg = message.message;
          console.log(msg);
          this.$refs.list.addMessage({
            mode: message.mode,
            text: msg.text,
            userId: message.userId,
          });
        }
      }
    },
    /**本质还要这个发送 */
    sendMsg(message) {
      this.socket.emit("message", message);
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
      if (cmd) {
        if (key == "#0#") {
          return { option: "server" };
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
          // this.addMessage(msg);
        }
      }
      return null;
    },
    addTransKeyInfo(key) {
      this.addMessage(this.cmdList[key].desc);
    },
    onSendMsg(message) {
      let data = message.message;
      let info = "";
      let cmdKey = "";
      if (data.trim() == "") {
        return;
      }
      if (data.indexOf("#") == 0) {
        //首文字开始
        for (let key of Object.keys(this.cmdList)) {
          if (data.indexOf(key) == 0) {
            cmdKey = key;
            info = data.replace(key, "");
            break;
          }
        }
        //NO
        if (cmdKey == "") {
          return;
        }
        const msg = this.getMsg(cmdKey);
        //Test処理
        if (cmdKey == "#TEST#") {
          this.addMessage(testData.listMsg());
        } else if (msg.option == "server") {
          this.addTransKeyInfo(cmdKey);
          if (cmdKey == "#0#") {
            //Need not to send
            this.addMessage(this.createCmdList());
          } else {
            if (msg.args) {
              msg.args.info = info;
            }
            this.sendMsg(msg);
          }
        }
      } else {
        this.addMessage(data);
        this.sendMsg({ mode: "input", text: data, threadId: this.thread });
      }
      this.$emit("onSendMsg", message);
    },

    async loaded() {
      var me = this;
      let rtn = await me.$axios.post(me.url + "cmd");
      this.cmdList = rtn.data;
      this.$refs.list.mode = "text";
      this.$refs.list.userId = "9999";
      this.socket.on("v2t", (txt) => {
        this.$refs.input.setInput(txt);
      });
      this.socket.on("newThread", (threadId) => {
        console.log(threadId);
        this.canUse = true;
        this.thread = threadId;
      });
      this.socket.on("message", (msg) => {
        console.log("cw", msg);
        //"FUNC" DO OUT
        if (msg.type == "AI") {
          this.addMessage({
            mode: "text",
            message: { text: msg.text },
            userId: this.thread,
          });
        } else {
          this.$emit("onMessage", msg);
        }
        // this.$emit("onMessage", msg);
      });
    },
  },
};
</script>

<style></style>
