<template>
  <van-uploader
    v-model="fileList"
    :multiple="true"
    :after-read="handleUpload"
    :before-read="beforeRead"
    :max-count="10"
    :preview-size="[300, 300]"
    accept=".xlsx"
  >
  </van-uploader>
</template>

<script>
import { Uploader } from "vant";
export default {
  components: {
    VanUploader: Uploader,
  },
  data() {
    return {
      fileList: [],
      url: "http://127.0.0.1:3000/",
    };
  },
  methods: {
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

    handleUpload: async function (files) {
      // 多图片上传
      files.status = "uploading";
      files.message = "上传中...";
      let formData = new FormData();
      //需要依次添加进去
      console.log(files);
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
      let res = await this.$axios({
        method: "post",
        url: this.url + "upload",
        data: formData,
      });
      console.log(res);
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
