const express = require('express');
const micRecord = require('node-mic-record');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// 创建一个 WebSocket 服务器
const server = require('http').Server(app);
const io = require('socket.io')(server);
const subscriptionKey = "6f78e68a9ef543988c4866e30d46bbae";
const serviceRegion = "japaneast";
// 监听客户端连接
io.on('connection', (socket) => {
  console.log('A user connected');

  // 开始录制麦克风输入
  const recognizer = new sdk.SpeechRecognizer({
    subscriptionKey: subscriptionKey,
    region: serviceRegion, // 例如：'eastus'
  });

  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  recognizer.recognizeOnceAsync(
    result => {
      console.log(`Recognized: ${result.text}`);
      socket.emit('transcription', result.text);
    },
    err => {
      console.error('Recognition error:', err);
      socket.emit('transcription', 'Recognition error');
    });

  // 处理客户端断开连接
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    recognizer.close();
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
