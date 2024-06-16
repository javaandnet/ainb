<template>
  <div>
    <vue-advanced-chat
      height="calc(100vh - 20px)"
      :single-room="true"
      :current-user-id="currentUserId"
      :show-files="false"
      :show-add-room="false"
      :show-emojis="false"
      :rooms="JSON.stringify(rooms)"
      :messages="JSON.stringify(messages)"
      :loading-rooms="false"
      :messages-loaded="true"
      :show-reaction-emojis="false"
      :auto-scroll="JSON.stringify(autoScroll)"
      :message-actions="JSON.stringify([])"
      @send-message="sendMessage($event.detail[0])"
      @record-voice="record($event.detail[0])"
      @record-status="recordStatus($event.detail[0])"
    />
  </div>
  <!-- calc(100vh - 20px) footer-->
</template>

<script>
import { register } from "./js/vue-advanced-chat.es";
import io from "socket.io-client";
register();
// text-messages
export default {
  mounted() {
    this.socket = io("http://192.168.1.160:3000");
    this.autoScroll = {
      send: {
        new: true,
        newAfterScrollUp: true,
      },
      receive: {
        new: true,
        newAfterScrollUp: true,
      },
    };
    this.socket.on("v2t", (txt) => {
         console.log(txt);
    });
    this.socket.on("message", (message) => {
      console.log(message);
      this.messages = [
        ...this.messages,
        {
          _id: this.messages.length,
          content: message.content,
          senderId: "9999",
          timestamp: new Date().toString().substring(16, 21),
          date: new Date().toDateString(),
        },
      ];
    });

    this.socket.on("newThread", (threadId) => {
      this.canUse = true;
      this.thread = threadId;
    });
  },
  data() {
    return {
      currentUserId: "1111",
      rooms: [
        {
          roomId: "1",
          roomName: "FSR",
          avatar: "https://66.media.tumblr.com/avatar_c6a8eae4303e_512.pnj",
          users: [{ _id: "1111", username: "FSR" }],
        },
      ],
      messages: [],
      messagesLoaded: true,
    };
  },

  methods: {
    addMessages(reset) {},
    record(data) {
      this.socket.emit("recording", {
        threadId: this.thread,
        data: data.buffer,
      });
    },
    recordStatus(flag) {
      if (flag == 1) {
        this.socket.emit("startRecord", {
          threadId: this.thread,
        });
      } else {
        this.socket.emit(
          "stopRecord",
          {
            threadId: this.thread,
          },
          (res) => {
            if (res.a == "fail") {
              this.messages = [
                ...this.messages,
                {
                  _id: this.messages.length,
                  content: "聞こえません",
                  senderId: "9999",
                  timestamp: new Date().toString().substring(16, 21),
                  date: new Date().toDateString(),
                },
              ];
            } else {
              this.messages = [
                ...this.messages,
                {
                  _id: this.messages.length,
                  content: res.q,
                  senderId: "1111",
                  timestamp: new Date().toString().substring(16, 21),
                  date: new Date().toDateString(),
                },
                {
                  _id: this.messages.length + 1,
                  content: res.a,
                  senderId: "9999",
                  timestamp: new Date().toString().substring(16, 21),
                  date: new Date().toDateString(),
                },
              ];
            }
            // document.getElementById("msg").innerHTML = `${res.a}`;
            // play(res.data);
          }
        );
      }
      console.log(flag);
    },
    sendMessage(message) {
      this.socket.emit("message", { threadId: this.thread, msg: message });

      this.messages = [
        ...this.messages,
        {
          _id: this.messages.length,
          content: message.content,
          senderId: this.currentUserId,
          timestamp: new Date().toString().substring(16, 21),
          date: new Date().toDateString(),
        },
      ];
    },
  },
};
</script>

<style lang="scss">
body {
  font-family: "Quicksand", sans-serif;
}
</style>
