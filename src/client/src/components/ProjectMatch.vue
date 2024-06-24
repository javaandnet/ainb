<template>
  <div>
    <DynamicList ref="senderList" />
    <van-space>
      <Select
        ref="senderTypeList"
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
import TestData from "../js/testData.js";
import { Divider } from "vant";
import { showDialog } from "vant";
import { Space } from "vant";
let testData = new TestData();
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
  emits: ["onClickLeftButton", "onClickRightButton"],
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  data() {
    return {
      initSelect: [1],
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
    onClickLeftButton: function () {
      this.$emit("onClickLeftButton");
    },
    onClickRightButton: function () {
      this.$emit("onClickRightButton");
    },
    onAddSender: function () {
      this.addSender({ type: "4", text: "FSR会社", value: "13" });
    },
    addSender: function (obj) {
      obj.icon = this.getIcon(obj.type);
      this.$refs.senderList.addObj(obj);
    },
    addWorker: function (obj) {
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
      this.$refs.senderList.setList(this.changeIcon(testData.getSenderList()));
      this.$refs.workerList.setList(this.changeIcon(testData.getWorkerList()));

      this.$refs.senderTypeList.setInitValue({
        value: 1,
        text: "案件",
      });
    },

    onClickListCell: async function (data) {
      //先弹Modal，显示详细信息
      try {
        const response = await this.$axios.post(
          "http://localhost:3000/model",
          data
        );

        showDialog({
          messageAlign: "left",
          allowHtml: true,
          title: response.data.name,
          message:
            response.data.information +
            "<br><br><a href='" +
            response.data.resume +
            "' target='_blank'>履歴書Download</a>",
        }).then(() => {
          // on close
        });
        console.log(response.data);
      } catch (error) {
        console.error("获取数据失败");
      }
    },
  },
};
</script>

<style></style>
*/
