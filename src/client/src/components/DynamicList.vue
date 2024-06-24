<template>
  <div>
    <van-list>
      <div v-if="isChecker != true">
        <div v-for="(item, index) in list" :key="index" class="list-item">
          <van-icon :name="item.icon" />
          <span class="span-left">{{ item.text }}</span>
          <van-icon name="close" @click="removeItem(index)" />
        </div>
      </div>
      <div v-else>
        <van-cell class="checkbox-cell" v-for="item in list" :key="item">
          <template #icon>
            <van-checkbox
              class="checkbox-checkbox"
              v-model="item.checked"
              @change="onCheckboxChangeInList(index)"
            >
            </van-checkbox>
          </template>
          <!-- 使用 right-icon 插槽来自定义右侧图标 -->
          <div
            class="div_list_cell"
            @click="onClickListCell(model, item.value)"
          >
            {{ item.text }}
          </div>
        </van-cell>
      </div>
    </van-list>
    <!--底部按钮-->
    <van-space>
      <van-button
        :type="button.left.type || 'success'"
        @click="onClickLeftButtonInList"
        size="small"
        v-if="button && button.left"
        >{{ button.left.label }}</van-button
      >
      <van-button
        :type="button.left.type || 'primary'"
        @click="onClickRightButtonInList"
        size="small"
        v-if="button && button.right"
        >{{ button.right.label }}</van-button
      >
    </van-space>
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
  emits: [
    "onClickListCell",
    "onClickLeftButtonInList",
    "onClickRightButtonInList",
    "onCheckboxChangeInList",
  ],
  props: {
    model: { type: String, default: "" },
    isChecker: { type: Boolean, default: false },
    button: { type: Object, "default": () => {} },
    initList: { type: Object, "default": () => [] },
  },
  data() {
    return {
      list: [],
    };
  },
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  methods: {
    loaded() {
      this.list = this.initList;
    },

    onClickLeftButtonInList() {
      let rtn = this.getListSelect();
      rtn.type = "left";
      this.$emit("onClickLeftButtonInList", rtn);
    },
    onClickRightButtonInList() {
      let rtn = this.getListSelect();
      rtn.type = "right";
      this.$emit("onClickRightButtonInList", rtn);
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
      let rtn = { model: this.model };
      let items = [];
      for (const ele of this.list) {
        if (ele.checked) {
          items.push(ele);
        }
      }
      rtn.items = items;
      return rtn;
    },
    onCheckboxChangeInList(index) {
      // console.log(`Checkbox for ${item.text} changed to ${item.checked}`);
      this.clickedItem = index;
      let rtn = this.getListSelect();
      rtn.type = "checkbox";
      this.$emit("onCheckboxChangeInList", rtn);
      // this.getListSelect();

      // 其他处理逻辑...
    },
    setList(list) {
      this.list = list;
    },
    getList() {
      return this.list;
    },
    addObj(obj) {
      this.list = [...this.list, obj];
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

    removeItem(index) {
      this.list.splice(index, 1);
    },
  },
};
</script>

<style>
.div_list_cell {
  color: "#233e50" !important;
  font-size: "" !important;
  padding-left: 5px;
  text-align: left; /* 文本左对齐 */
}
.checkbox-list-container {
  padding: 20px;
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
.checkbox-checkbox {
  display: flex;
  align-items: left;
}
.checkbox-cell {
  display: flex;
  align-items: left;
}

.checkbox-cell .van-checkbox {
  margin-left: auto;
}
.span-left {
  position: relative;
  padding-left: 4px;
  width: 100%;
  left: 2px; /* 向右偏移20px */
  text-align: left; /* 文本左对齐 */
}
.span-right {
  position: relative;
  padding-right: 4px;
  width: 100%;
  left: 2px; /* 向右偏移20px */
  text-align: right; /* 文本左对齐 */
}
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: left;
  padding: 10px;
  border-bottom: 1px solid #ebebeb;
}
</style>
