const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));


// 使用 body-parser 中间件来解析音频数据
app.use(bodyParser.raw({ type: 'audio/webm' }));

// 处理音频数据的路由
app.post('/send-audio', (req, res) => {
  // 获取客户端发送的音频数据
  const audioData = req.body;

  // 在这里处理音频数据，比如保存到文件或者进行其他操作
  console.log(audioData);
  // 发送响应
  res.send('Audio data received');
});

 
io.on('connection', (socket) => {
  console.log('A user 111');
  console.log('A user connected');

  // 监听客户端发送的音频数据
  socket.on('audio', (data) => {
    console.log('Received audio data:', data);

    // 在这里你可以处理接收到的音频数据，比如保存到文件或者进行语音识别
  });

  // 处理客户端断开连接
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});