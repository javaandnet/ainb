<template>
  <div>
    <DynamicList ref="senderList" />
    <van-divider>技術者一覧</van-divider>
    <DynamicList ref="workerList" />
    <van-button type="primary" @click="send">発送</van-button>
  </div>
</template>

<script>
import DynamicList from "../components/DynamicList.vue";
import TestData from "../js/testData.js";
import { Divider } from "vant";
import { showDialog } from "vant";
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
    VanDivider: Divider,
    DynamicList,
  },
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  methods: {
    send: function () {
        
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
