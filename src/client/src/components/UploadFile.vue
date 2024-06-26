<template>
  <div>
    <div>
      <van-uploader
        v-model="fileList"
        :multiple="true"
        :reupload="true"
        :after-read="handleUpload"
        :before-read="beforeRead"
        :max-count="10"
        :preview-size="[300, 150]"
        accept=".xlsx"
      >
      </van-uploader>
    </div>
    <div>
      <van-button
        type="primary"
        @click="onClickClose"
        icon="cross"
        size="large"
      >
        閉じる</van-button
      >
    </div>
    <DynamicList
      ref="senderList"
      :initList="list"
      :confirmBeforeDelete="true"
      @onRemoveItem="onRemoveItem"
    />
  </div>
</template>

<script>
import { Uploader } from "vant";
import { showToast } from "vant";
import DynamicList from "../components/DynamicList.vue";
export default {
  components: {
    DynamicList,
    VanUploader: Uploader,
  },
  data() {
    return {
      fileList: [],
      list: [
        { type: "0", text: "FSR会社", value: "11" },
        { type: "1", text: "SAP案件説明名", value: "11" },
        { type: "2", text: "メール例 nin@fsr.co.jp", value: "11" },
        { type: "3", text: "任（企業Wecom）", value: "11" },
        { type: "4", text: "個人名", value: "11" },
      ],
    };
  },
  emits: ["onUploaded", "onClickClose", "onRemoveItem"],
  props: {
    url: { type: String, default: "http://127.0.0.1:3000/" },
  },
  methods: {
    onClickClose() {
      this.$emit("onClickClose");
    },

    beforeRead(file) {
      if (!Array.isArray(file)) {
        file = [file];
      }
      const isXlsx = file.some(
        (element) =>
          element.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      if (!isXlsx) {
        console.error("请上传xlsx文件");
      }
      return isXlsx;
    },
    onRemoveItem: function (item, cb) {
      this.$emit("onRemoveItem", item, (val) => {
        cb(val); //依次传递，处理返回值
      });
    },
    handleUpload: async function (files) {
      // 多图片上传
      files.status = "uploading";
      files.message = "上传中...";
      let formData = new FormData();
      //需要依次添加进去

      for (let i = 0; i < files.length; i++) {
        let file = files[i].file;
        const fileName = file.name;
        const encodedFileName = encodeURI(
          fileName.substring(0, fileName.lastIndexOf("."))
        );
        const blob = file.slice(0, file.size, file.type);
        const fileExtention = fileName.substring(fileName.lastIndexOf(".") + 1);
        const renamedFile = new File(
          [blob],
          encodedFileName + "." + fileExtention,
          { type: file.type }
        );
        files[i].file = renamedFile;
        formData.append("files", renamedFile);
      }
      const res = await this.$axios({
        method: "post",
        url: this.url + "upload",
        data: formData,
      });
      if (res.data && res.data.msg == "ok") {
        showToast("成功");
        this.fileList = [];
        this.$emit("onUploaded");
      }
      // console.log(res);
      // if (res.status === 200) {
      //   file.status = "done";
      //   file.message = "上传成功";
      // } else {
      //   file.status = "failed";
      //   file.message = "上传失败";
      // }
    },
  },
};
</script>
<style scoped>
/* 添加一些样式 */
</style>
