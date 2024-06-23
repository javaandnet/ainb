<template>
  <div>
    <van-list v-model="list">
      <div v-for="(item, index) in list" :key="index" class="list-item">
        <van-icon :name="item.icon" />
        <span class="span-left">{{ item.text }}</span>
        <van-icon name="close" @click="removeItem(index)" />
      </div>
    </van-list>
   </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      newItem: "",
    };
  },
  methods: {
    setList(list) {
      this.list = list;
    },
    getIcon(type) {
      //企業
      if (type == 0) {
        return "";
        //案件
      } else if (type == 1) {
        return "description-o";
        //Mail
      } else if (type == 2) {
        return "envelop-o";
        //個人
      } else if (type == 3) {
        return "user-o";
        //その他
      } else {
        return "";
      }
    },

    addItem() {
      if (this.newItem.trim() !== "") {
        this.list.push(this.newItem);
        this.newItem = "";
      }
    },
    removeItem(index) {
      this.list.splice(index, 1);
    },
  },
};
</script>

<style>
.span-left {
  position: relative;
  padding-left: 4px;
  width: 100%;
  left: 2px; /* 向右偏移20px */
  text-align: left; /* 文本左对齐 */
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: left;
  padding: 10px;
  border-bottom: 1px solid #ebebeb;
}
</style>
