<template>
  <div>
    <van-field
      v-model="fieldValue"
      is-link
      readonly
      :label="label"
      placeholder=""
      @click="showPicker = true"
    />
    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker
        v-model="selectedValue"
        :columns="list"
        :value-key="'value'"
        :default-index="3"
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script>
import { field, popup, Checkbox } from "vant";

export default {
  name: "Select",
  components: {
    VanPopup: popup,
    VanField: field,
    VanCheckbox: Checkbox,
  },

  props: {
    label: { type: String, default: "" },
    list: { type: Array, "default": () => [] },
  },
  mounted() {
    // 组件挂载后调用的方法
    this.loaded();
  },
  data() {
    return {
      value: "",
      fieldValue: "",
      showPicker: false,
      selectedValue: [2],
    };
  },
  methods: {
    loaded: function () {},
    setInitValue: function (obj) {
      this.fieldValue = obj.text;
      this.selectedValue = [obj.value];
    },
    getValue() {
      return this.value;
    },
    onConfirm({ selectedOptions }) {
      // this.selectedValue = { selectedOptions }; // 更新选中的值
      this.showPicker = false;
      this.fieldValue = selectedOptions[0].text;
      console.log(this.selectedValue);
      this.value = selectedOptions[0].value;
    },
  },
};
</script>

<style></style>
