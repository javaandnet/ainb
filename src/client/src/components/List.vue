<template>
  <div class="chat-container">
    <van-list v-model="loading" finished="finished" finished-text="没有更多了">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['chat-item', message.isMine ? 'mine' : 'theirs']"
      >
        <div class="chat-content">
          <p>{{ message.text }}</p>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script>
import { List } from "vant";
import "vant/lib/index.css";

export default {
  components: {
    VanList: List,
  },
  data() {
    return {
      messages: [
        { text: "你好", isMine: false },
        { text: "你好！有什么需要帮助的吗？", isMine: true },
        { text: "我想了解一下你们的产品。", isMine: false },
        { text: "好的，请问您对哪方面感兴趣？", isMine: true },
                { text: "你好", isMine: false },
        { text: "你好！有什么需要帮助的吗？", isMine: true },
        { text: "我想了解一下你们的产品。", isMine: false },
        { text: "好的，请问您对哪方面感兴趣？", isMine: true },
                { text: "你好", isMine: false },
        { text: "你好！有什么需要帮助的吗？", isMine: true },
        { text: "我想了解一下你们的产品。", isMine: false },
        { text: "好的，请问您对哪方面感兴趣？", isMine: true },
                { text: "你好", isMine: false },
        { text: "你好！有什么需要帮助的吗？", isMine: true },
        { text: "我想了解一下你们的产品。", isMine: false },
        { text: "好的，请问您对哪方面感兴趣？", isMine: true },
                { text: "你好", isMine: false },
        { text: "你好！有什么需要帮助的吗？", isMine: true },
        { text: "我想了解一下你们的产品。", isMine: false },
        { text: "好的，请问您对哪方面感兴趣？", isMine: true },
                { text: "你好", isMine: false },
        { text: "你好！有什么需要帮助的吗？", isMine: true },
        { text: "我想了解一下你们的产品。", isMine: false },
        { text: "好的，请问您对哪方面感兴趣？", isMine: true },
      ],
      loading: false,
      finished: true,
    };
  },
};
</script>

<style scoped>
.chat-container {
  /* max-width: 600px; */
  height:70vh;
    max-height:90%;
  margin: 0 auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.chat-item {
  display: flex;
  margin: 5px 0; /* 减小上下空白 */
}

.chat-item.theirs {
  justify-content: flex-start;
}

.chat-item.mine {
  justify-content: flex-end;
  margin-bottom: 4px;
  margin-top: 4px;
}

.chat-content {
  position: relative;
  max-width: 70%;
  padding-top: 0px;
  margin-bottom: 4px;
  margin-top: 4px;
  padding-left: 4px;
  padding-right: 3px;

  border-radius: 10px;
  background-color: #e0e0e0;
  color: #000;
}

.chat-item.mine .chat-content {
  background-color: #007aff;
  color: #fff;
}

/* 气泡小尾巴 */
.chat-item.theirs .chat-content::before {
  content: "";
  position: absolute;
  top: 10px; /* 调整尾巴位置 */
  left: -10px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent #e0e0e0 transparent transparent;
}

.chat-item.mine .chat-content::before {
  content: "";
  position: absolute;
  top: 10px; /* 调整尾巴位置 */
  right: -10px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent transparent #007aff;
}
</style>
