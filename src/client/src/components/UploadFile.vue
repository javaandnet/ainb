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

    <div class="list-container">
      <DynamicList
        ref="fileList"
        :initList="list"
        :confirmBeforeDelete="true"
        @onRemoveItem="onRemoveItem"
        @onClickListCell="$emit('onClickListCell', $event)"
      />
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
  props: {
    initList: { type: Object, "default": () => [] },
    url: { type: String, default: "http://127.0.0.1:3000/" },
  },
  data() {
    return {
      fileList: [],
      list: [],
    };
  },
  emits: ["onUploaded", "onClickClose", "onRemoveItem", "onClickListCell"],

  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  methods: {
    loaded() {
      this.list = this.initList;
      this.refresh();
    },
    async refresh() {
      const res = await this.$axios.post(this.url + "files", {
        option: "list",
      });
      for (const file of res.data) {
        this.$refs.fileList.addObj({ type: "2", text: file, value: file });
      }
    },
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
    onRemoveItem: async function (item, cb) {
      const res = await this.$axios.post(this.url + "files", {
        option: "delete",
        id: item.value,
      });
      let rtn = true;
      if (res.data != "ok") {
        rtn = false;
      }
      cb(rtn);
      // this.$emit("onRemoveItem", item, (val) => {
      //   cb(val); //依次传递例，处理返回值
      // });
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
.list-container {
  height: 500px; /* 设置容器高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}
</style>
