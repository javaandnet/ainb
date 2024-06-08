const micRecord = require('node-mic-record');
const fs = require('fs');

// 指定保存音频文件的路径
const filePath = 'audio.wav';

// 开始录制麦克风输入
const recorderStream = micRecord.start({
  bitDepth: 16,          // 采样位深度
  channels: 1,           // 通道数
  sampleRate: 16000,     // 采样率
  recordProgram: 'rec',  // 录制程序 (默认为 'rec', 也可以是 'arecord' 或 'sox')
});

// 创建一个可写流，用于将录制的音频数据写入文件
const fileStream = fs.createWriteStream(filePath);

// 将录制的音频数据写入文件
recorderStream.pipe(fileStream);

// 处理录制器错误
recorderStream.on('error', (err) => {
  console.error('Recorder error:', err);
});

// 在录制完成后关闭文件流
recorderStream.on('end', () => {
  console.log('Recording finished');
  fileStream.close();
});

// 如果需要手动停止录制，可以调用 recorderStream.stop();
