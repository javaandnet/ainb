<template>
  <div>
    <DynamicList ref="senderList" />
    <van-field
      v-if="showMail == true"
      v-model="addMail"
      label=""
      placeholder="メールを入力してくださいï"
    />
    <van-space>
      <Select
        ref="senderTypeList"
        @onSelect="onSelect"
        :list="sendTypeList"
        label="送りタイプ"
        :selectedValue="initSelect"
      />
      <van-button type="primary" @click="onAddSender">宛先追加</van-button>
    </van-space>
    <van-divider>技術者一覧</van-divider>
    <DynamicList ref="workerList" /><!--:isChecker="true"-->
    <van-space>
      <van-button type="primary" @click="onClickLeftButton">発送確認</van-button
      ><van-button type="warning" @click="onClickRightButton"
        >閉じる</van-button
      >
    </van-space>
  </div>
</template>

<script>
import DynamicList from "../components/DynamicList.vue";
import Select from "../components/Select.vue";
// import TestData from "../js/testData.js";
import { Divider } from "vant";
// import { showDialog } from "vant";
import { Space } from "vant";
// let testData = new TestData();
/**
 * 上部为一个案件 不是必须
 * 下部为动态列表 显示技术者
 *
 * 两个按钮 一个 发送邮件 一个发送企业微信
 */
export default {
  name: "App",
  components: {
    VanSpace: Space,
    VanDivider: Divider,
    DynamicList,
    Select,
  },
  emits: ["onClickLeftButton", "onClickRightButton", "loaded"],
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  data() {
    return {
      selectType: 0, //選択タイプ
      addMail: "",
      showMail: false,
      initFLg: false,
      initSelect: [1],
      initData: {},
      selectedValues: {
        value: 1,
        text: "案件",
      },
      sendTypeList: [
        {
          value: 0,
          text: "企業",
        },
        {
          value: 1,
          text: "案件",
        },
        {
          value: 2,
          text: "メール",
        },
        {
          value: 3,
          text: "企業Wechat",
        },
        {
          value: 4,
          text: "個人",
        },
      ],
    };
  },

  methods: {
    onSelect: function (data) {
      if (data[0]) {
        data = 2;
      }
      this.selectType = data;
      if (data == 2) {
        this.showMail = true;
      }
    },
    sync: function (data) {
      //items
      let list = this.$refs.senderList.getList();
      if (data.model == "worker") {
        list = this.$refs.workerList.getList();
      }
      for (let item of data.items) {
        if (!this.objInArray(item, list)) {
          if (data.model == "worker") {
            item.type = 9;
            this.addWorker(item);
          } else {
            if (typeof this.type == "undefined") {
              item.type = 1;
            }
            this.addSender(item);
          }
        }
      }
    },
    objInArray: function (data, objArray) {
      return objArray.some((obj) => obj.value === data.value);
    },
    onClickLeftButton: function () {
      this.$emit("onClickLeftButton");
    },
    onClickRightButton: function () {
      this.$emit("onClickRightButton");
    },
    getInfo: function () {
      return {
        sender: this.$refs.senderList.getList(),
        worker: this.$refs.workerList.getList(),
      };
    },
    onAddSender: function () {
      console.log(this.selectType);
      if (this.selectType == 2) {
        //不同选项不同操作
        this.addSender({
          type: this.selectType,
          text: this.addMail,
          value: this.addMail,
        });
      } else {
        //不同选项不同操作
        this.addSender({ type: this.selectType, text: "FSR会社", value: "13" });
      }
    },
    addSender: function (obj) {
      obj.icon = this.getIcon(obj.type);
      this.$refs.senderList.addObj(obj);
    },
    addWorker: function (obj) {
      console.log("addWorker", obj);
      obj.icon = this.getIcon(obj.type);
      this.$refs.workerList.addObj(obj);
    },
    getIcon: function (type) {
      //企業
      if (type == 0) {
        return "wap-home";
        //案件
      } else if (type == 1) {
        return "description-o";
        //Mail
      } else if (type == 2) {
        return "envelop-o";
        //企業Wechat
      } else if (type == 3) {
        return "wechat";
        //その他
      } else if (type == 4) {
        return "friends-o";
        //その他
      } else {
        return "";
      }
    },
    changeIcon: function (list) {
      for (let ele of list) {
        ele.icon = this.getIcon(ele.type);
      }
      return list;
    },
    loaded: function () {
      this.$emit("loaded");
      this.$refs.senderTypeList.setInitValue({
        value: 1,
        text: "案件",
      });
    },
  },
};
</script>

<style></style>
*/
