<template>
  <div>
    <van-list>
      <div v-if="isChecker != true">
        <div v-for="(item, index) in list" :key="index" class="list-item">
          <van-icon :name="item.icon" />
          <span class="span-left" @click="onClickListCell(model, item)">{{
            item.text
          }}</span>
          <van-field  v-model="item.info" label="" :border="true" v-if="isInput"/>
          <van-icon
            v-if="isDelete == true"
            name="close"
            @click="removeItem(index)"
          />
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
          <div class="div_list_cell" @click="onClickListCell(model, item)">
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
        :type="button.right.type || 'primary'"
        @click="onClickRightButtonInList"
        size="small"
        v-if="button && button.right"
        >{{ button.right.label }}</van-button
      >
    </van-space>
  </div>
</template>
<script>
import { List, Cell, Checkbox, Field } from "vant";
import { showConfirmDialog } from "vant";
import "vant/lib/index.css";
export default {
  components: {
    Field: Field,
    VanCell: Cell,
    VanList: List,
    VanCheckbox: Checkbox,
  },
  emits: [
    "onClickListCell",
    "onClickLeftButtonInList",
    "onClickRightButtonInList",
    "onCheckboxChangeInList",
    "onRemoveItem",
  ],
  props: {
    isInput: { type: Boolean, default: false },
    confirmBeforeDelete: { type: Boolean, default: false },
    model: { type: String, default: "" },
    isDelete: { type: Boolean, default: true },
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
    onClickListCell(model, item) {
      this.$emit("onClickListCell", {
        model: model,
        id: item.value,
        text: item.text,
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

    removeItem(index) {
      var me = this;
      function doRemove(index) {
        //First bak
        me.bakItem = me.list[index];
        me.bakIndex = index;
        me.list.splice(index, 1);

        me.$emit("onRemoveItem", me.bakItem, function (success = true) {
          if (!success) {
            me.list.splice(index, 0, me.bakItem);
          }
        });
      }

      if (this.confirmBeforeDelete) {
        showConfirmDialog({
          message: "選択したものを削除してよろしいでしょうか？",
        })
          .then(function () {
            doRemove(index);
          })
          .catch(() => {
            // on cancel
          });
      } else {
        doRemove(index);
      }
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
  width: 40%;
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
  padding: 4px;
  justify-content: space-between;
  align-items: left;
  padding: 10px;
  border-bottom: 1px solid #ebebeb;
}
</style>
