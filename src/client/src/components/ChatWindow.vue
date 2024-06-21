<template>
  <div style="padding:5px;">
    <div>
      <List />
    </div>
    <div>
      <InputMessage />
    </div>
  </div>
</template>

<script>
import InputMessage from "./InputMessage.vue";
import List from "./List.vue";

export default {
  name: "App",
  components: {
    InputMessage,
    List,
  },
};
</script>

<style></style>
