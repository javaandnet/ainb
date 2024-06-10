const fs = require('fs');
const record = require('node-record-lpcm16');

// 设置音频参数
const audioOptions = {
    sampleRateHertz: 16000,
    threshold: 0.5,
    verbose: true,
    recordProgram: 'rec', // 或者使用 'arecord'（Linux）或 'sox'（macOS）
};

// 开始录制
const recording = record.start(audioOptions);

// 监听录制事件
recording.on('data', (data) => {
    console.log(`正在录制 ${data.length} bytes of data.`);
});

recording.pipe(fs.createWriteStream('recorded_audio.wav'));

// 某个时间后停止录制
setTimeout(() => {
    record.stop();
    console.log('录制已停止.');
}, 5000); // 录制时间为 5 秒
