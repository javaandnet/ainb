<template>
  <div>
    <Rec ref="rec" />
    <div class="padding">
      <!-- 两端对齐 -->
      <van-row justify="space-between">
        <van-col span="1"
          ><van-button
            type="primary"
            @click="startRecord"
            icon="service"
          ></van-button
        ></van-col>
        <van-col span="16">
          <van-field
            v-model="message"
            placeholder="情報を入力してください"
            rows="1"
            
            type="textarea"
            show-word-limit
        /></van-col>
        <van-col span=""
          ><van-button type="primary" icon="chat"></van-button
        ></van-col>
      </van-row>
    </div>
  </div>
</template>
<style scoped>
.padding {
  padding: 5px;
}
</style>
<script>
import { Space, Button, Field } from "vant";
import { Col, Row } from "vant";
import Rec from "./Rec.vue";

export default {
  components: {
    Field: Field,
    Space: Space,
    VanButton: Button,
    VanCol: Col,
    VanRow: Row,

    Rec: Rec,
  },
  data() {
    return {
      message: "",
      show: true,
    };
  },
  methods: {
    startRecord() {
      this.$refs.rec.startRecord();
    },
  },
};
</script>
