<template>
  <div>
    <van-overlay :show="show">
      <div class="container">
        <div>
          <div class="transparent-div">
            <div>
              <van-icon
                v-if="recording"
                name="play-circle-o"
                size="6rem"
                class="record-icon"
                style="opacity: 0.9"
              />
              <van-icon
                v-else
                name="service"
                size="6rem"
                class="record-icon"
                style="opacity: 0.9"
              />
            </div>
            <van-button
              type="primary"
              @click="stopRecording"
              icon="stop-circle-o"
            >
              クリック停止</van-button
            >
          </div>
          <div></div>
        </div>
      </div>
    </van-overlay>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
    };
  },
  methods: {
    startDialog() {
      this.show = true;
    },

    stopRecording() {
      this.show = false;
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 使容器占满整个视口高度 */
}

.transparent-div {
  width: 300px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5); /* 背景颜色设置为黑色，透明度为 0.5 */
  color: white; /* 设置文字颜色为白色 */
  border-radius: 8px; /* 圆角边框 */
}

.record-animation {
  opacity: 0.1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 10rem; /* 调整录音动画容器的高度 */
}

.record-icon {
  animation: pulse 1.5s infinite; /* 添加一个简单的脉动动画 */
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
