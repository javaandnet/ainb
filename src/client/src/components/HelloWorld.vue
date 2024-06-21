<template>
  <div>
    <van-button type="primary" @click="showDialog" icon="service"></van-button>  
    <van-dialog v-model:show="show" title="录音" show-cancel-button @confirm="startRecording" @cancel="stopRecording">
      <div v-if="recording">
        <p>录音中...</p>
        <van-button type="danger" @click="stopRecording">停止录音</van-button>
      </div>
      <div v-else>
        <p>点击确定开始录音</p>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import { Button, Dialog } from 'vant';
import 'vant/lib/index.css';

export default {
  components: {
    'van-button': Button,
    'van-dialog': Dialog,
  },
  setup() {
    const show = ref(false);
    const recording = ref(false);
    let mediaRecorder;
    let audioChunks = [];

    const showDialog = () => {
      show.value = true;
    };

    const startRecording = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('浏览器不支持录音功能');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
          audioChunks = [];
        };
        mediaRecorder.start();
        recording.value = true;
      } catch (error) {
        alert('无法访问麦克风');
      }
    };

    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recording.value = false;
      }
      show.value = false;
    };

    return {
      show,
      recording,
      showDialog,
      startRecording,
      stopRecording,
    };
  },
};
</script>

<style>
/* 添加一些基本样式 */
</style>
