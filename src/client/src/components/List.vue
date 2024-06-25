<template>
  <div class="chat-container">
    <van-list v-model="loading" finished="finished" finished-text="">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['chat-item', message.userId == userId ? 'mine' : 'theirs']"
      >
        <div
          v-if="message.mode == 'text' && message.text"
          class="chat-content"
        >
          <p class="chat-txt">
            {{ message.text }}
          </p>
        </div>

        <div v-else>
          <!--第二层内部循环-->
          <DynamicList
            ref="messageList"
            :isDelete="message.isDelete"
            :isChecker="message.isChecker"
            :model="message.model"
            :initList="message.list"
            :button="message.button"
            @onClickListCell="onClickListCell"
            @onClickRightButtonInList="onClickRightButtonInList"
            @onClickLeftButtonInList="onClickLeftButtonInList"
            @onCheckboxChangeInList="onCheckboxChangeInList"
          />
        </div>
      </div>
    </van-list>
  </div>
</template>

<script>
import DynamicList from "../components/DynamicList.vue";
import { List, Cell, Checkbox } from "vant";
import "vant/lib/index.css";

export default {
  components: {
    VanCell: Cell,
    VanList: List,
    VanCheckbox: Checkbox,
    DynamicList,
  },
  emits: [
    "onClickListCell",
    "onClickLeftButtonInList",
    "onClickRightButtonInList",
    "onCheckboxChangeInList",
  ],
  props: {},
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  methods: {
    loaded() {
      // this.$refs.messageList.setList(this.list);
    },
    addMessage(message) {
      console.log("List:", message);
      this.messages = [...this.messages, message];
    },
    /**
     * 向父激发选择的单元格事项
     */
    onClickListCell(obj) {
      this.$emit("onClickListCell", obj);
    },
    onClickLeftButtonInList(obj) {
      this.$emit("onClickLeftButtonInList", obj);
    },
    onClickRightButtonInList(obj) {
      this.$emit("onClickRightButtonInList", obj);
    },
    onCheckboxChangeInList(obj) {
      console.log(obj);
      this.$emit("onCheckboxChangeInList", obj);
    },
  },
  data() {
    return {
      userId: "9999",
      mode: "list",
      model: "project",
      clickedItem: 0, //最近选择
      msg: {
        text: "",
        value: "",
        time: "",
        userId: "",
        link: "",
      },
      messages: [],
      list: [],
      loading: false,
      finished: true,
    };
  },
};
//Message =>Json 点击执行啥动作
</script>

<style scoped>
.div_list_cell {
  padding-left: 5px;
}
.checkbox-list-container {
  padding: 20px;
}
.checkbox-cell {
  display: flex;
  align-items: center;
}

.checkbox-cell .van-checkbox {
  margin-left: auto;
}
.chat-container {
  overflow-y: auto;
  /* max-width: 600px; */
  height: 80vh;
  max-height: 90%;
  margin: 0 auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.chat-item {
  display: flex;
  margin: 5px 0; /* 减小上下空白 */
}
.chat-txt {
  padding: 2px;
  padding-right: 8px;
  margin-bottom: 2px;
  margin-top: 2px;
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
