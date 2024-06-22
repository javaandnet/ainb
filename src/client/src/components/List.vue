<template>
  <div class="chat-container">
    <van-list v-model="loading" finished="finished" finished-text="">
      <div v-if="mode == 'text'">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['chat-item', message.userId == userId ? 'mine' : 'theirs']"
        >
          <div v-if="message.text">
            <div class="chat-content">
              <p class="chat-txt">
                {{ message.text }}
              </p>
            </div>
          </div>
          <div v-else>
            <van-cell
              class="checkbox-cell"
              v-for="item in message.list"
              :key="item"
              :size="large"
            >
              <van-checkbox
                v-model="item.checked"
                @change="onCheckboxChange(item, index)"
              >
              </van-checkbox>
              <!-- 使用 right-icon 插槽来自定义右侧图标 -->
              <template #right-icon
                ><div
                  class="div_list_cell"
                  @click="onClickListCell(message.model, item.value)"
                >
                  {{ item.text }}
                </div>
              </template>
            </van-cell>
          </div>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script>
import { List, Cell, Checkbox } from "vant";
import "vant/lib/index.css";

export default {
  components: {
    VanCell: Cell,
    VanList: List,
    VanCheckbox: Checkbox,
  },
  emits: ["clickCell"],
  props: {},
  methods: {
    onCheckboxChange(item, index) {
      this.clickedItem = index;
      this.getListSelect();
      console.log(`Checkbox for ${item.text} changed to ${item.checked}`);
      // 其他处理逻辑...
    },
    addMessage(message) {
      this.messages = [...this.messages, message];
    },
    /**
     * 向父激发选择的单元格事项
     */
    onClickListCell(model, id) {
      this.$emit("onClickListCell", {
        model: model,
        id: id,
      });
    },
    //最近选择的列表，选择一览提出
    getListSelect() {
      const message = this.messages[this.clickedItem];
      let rtn = { model: message.model };
      let items = [];
      for (const ele of message.list) {
        if (ele.checked) {
          items.push(ele.value);
        }
      }
      rtn.items = items;
      console.log(rtn);
      return rtn;
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
.checkbox-list-container {
  padding: 20px;
}
.div_list_cell {
  padding-left: 5px;
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
