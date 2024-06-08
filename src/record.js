const record = require('node-record-lpcm16');
const fs = require('fs');

const filename = 'test.raw';
const file = fs.createWriteStream(filename);

const encoding = 'LINEAR16';
const sampleRate = 16000;

record.start({
  sampleRateHertz: sampleRate,
  encoding: encoding,
  recordProgram: 'sox'
}).pipe(file);

setTimeout(function () {
  record.stop();
}, 7000);