<template>
  <div>
    <DynamicList ref="senderList" />

    <van-space>
      <Select
        v-if="false"
        ref="senderTypeList"
        @onSelect="onSelect"
        :list="sendTypeList"
        label="送りタイプ"
        :selectedValue="initSelect"
      />
      <van-field
        v-if="showMail == true"
        v-model="addMail"
        label=""
        placeholder="メールを入力してくださいï"
      />
      <van-button type="primary" @click="onAddSender">Mail追加</van-button>
    </van-space>
    <van-divider>技術者一覧</van-divider>
    <DynamicList ref="workerList" :isInput="true" /><!--:isChecker="true"-->
    <van-space>
      <van-button type="primary" @click="onClickLeftButton"
        >情報を送る</van-button
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
      selectType: 2, //選択タイプ
      addMail: "",
      showMail: true,
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
    isValidEmail: function (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    onSelect: function (data) {
      if (data[0]) {
        data = 2;
      }
      this.selectType = data;
      if (data == 2) {
        this.showMail = true;
      }
    },
    /**
     *根据选择 自动同步
     */
    sync: function (data) {
      console.log("sync", data);

      let list = this.$refs.senderList.getList();
      if (data.model == "worker") {
        list = this.$refs.workerList.getList();
      }
      for (let item of data.items) {
        //items
        item.model = data.model;
        item.type = this.getType(item.model);
        item.icon = this.getIconByModel(item.model);
        if (!this.objInArray(item, list)) {
          if (data.model == "worker") {
            this.addWorker(item);
          } else {
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
    /**Email 只有 */
    onAddSender: function () {
      if (this.selectType == 2) {
        if (!this.isValidEmail(this.addMail)) {
          alert("Not Email 格式");
          return;
        }
        const model = "mail";
        //不同选项不同操作
        this.addSender({
          type: this.selectType,
          model: model,
          icon: this.getIconByModel(model),
          text: this.addMail,
          value: this.addMail,
        });
      } else {
        //不同选项不同操作
        this.addSender({ type: this.selectType, text: "FSR会社", value: "13" });
      }
    },
    addSender: function (obj) {
      console.log("addSender", obj);

      this.$refs.senderList.addObj(obj);
    },
    addWorker: function (obj) {
      console.log("addWorker", obj);

      this.$refs.workerList.addObj(obj);
    },
    getIconByModel: function (model) {
      //企業
      if (model == "account") {
        return "wap-home";
        //案件
      } else if (model == "project") {
        return "description-o";
        //Mail
      } else if (model == "mail") {
        return "envelop-o";
        //企業Wechat
      } else if (model == "user") {
        return "wechat";
        //その他
      } else if (model == "contact") {
        return "friends-o";
        //その他
      } else {
        return "manager-o";
      }
    },
    getType: function (model) {
      //企業
      if (model == "account") {
        return 0;
        //案件
      } else if (model == "project") {
        return 1;
        //Mail
      } else if (model == "mail") {
        return 2;
        //企業Wechat
      } else if (model == "contact") {
        return 3;
        //その他
      } else if (model == "friend") {
        return 4;
        //その他
      } else if (model == "worker") {
        return 9;
        //その他
      } else {
        return 2;
      }
    },
    changeIcon: function (list) {
      for (let ele of list) {
        ele.icon = this.getIconByModel(ele.model);
      }
      return list;
    },
    loaded: function () {
      this.$emit("loaded");
      // this.$refs.senderTypeList.setInitValue({
      //   value: 1,
      //   text: "案件",
      // });
      // this.addWorker({
      //   text: "宋岩",
      //   value: "a05F300000HYu5xIAD",
      //   checked: true,
      //   type: 9,
      //   icon: "",
      // });
    },
  },
};
</script>

<style></style>
*/
