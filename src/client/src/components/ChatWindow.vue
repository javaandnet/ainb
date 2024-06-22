<template>
  <div style="padding: 5px">
    <div>
      <List ref="list" @onClickListCell="onClickListCell" />
    </div>
    <div>
      <InputMessage
        ref="input"
        @sendMsg="sendMsg"
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

export default {
  name: "App",
  components: {
    InputMessage,
    List,
  },
  emits: ["onMessage", "onClickListCell"],
  props: {
    userId: { type: String, default: "9999" },
    url: { type: String, default: "" },
  },
  data() {
    return {
      threadId: "",
    };
  },
  mounted() {
    this.socket = io(this.url);
    // 组件挂载后调用的方法
    this.loaded();
  },

  methods: {
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
      if (message.mode && message.mode == "list") {
        console.log("list22", message);
        this.$refs.list.addMessage({
          model: message.model,
          list: message.list,
          userId: this.thread,
        });
      } else {
        const msg = message.message;
        this.$refs.list.addMessage({
          text: msg.content,
          userId: this.thread,
        });
      }
    },

    sendMsg(message) {
      //    msg: {
      //     text: "",
      //     value: "",
      //     time: "",
      //     userId: "",
      //     link: "",
      //   }
      var me = this;
      var _message = message.message;
      if (message.message == "#TEST#") {
        _message = message.message;
        this.$emit("onMessage", {
          message: _message,
        });
      } else {
        this.socket.emit("message", {
          threadId: me.thread,
          msg: { content: _message },
        });
      }
      //Listに追加
      this.$refs.list.addMessage({
        text: _message,
        userId: this.userId,
      });
    },
    loaded() {
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
        this.$emit("onMessage", {
          message: msg,
        });
      });
    },
  },
};
</script>

<style></style>
