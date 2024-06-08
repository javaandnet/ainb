const express = require('express')
const fs = require('fs');
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const WavEncoder = require('wav-encoder')
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const { Readable } = require('stream');
const subscriptionKey = "6f78e68a9ef543988c4866e30d46bbae";
const serviceRegion = "japaneast";
//const ffmpeg = require('fluent-ffmpeg');

var json = [{
    q: "自己紹介をお願いします。"
}, {
    q: "一番得意言語はなんですか？"
}];


// 创建一个从 ArrayBuffer 读取数据的 Readable Stream
class ArrayBufferReadable extends Readable {
    constructor(buffer) {
        super();
        this.buffer = Buffer.from(buffer);
        this.sent = false;
    }

    _read() {
        if (!this.sent) {
            this.push(this.buffer);
            this.sent = true;
        } else {
            this.push(null);
        }
    }
}


// 创建语音配置
const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
// 设置语音合成的语言
speechConfig.speechSynthesisLanguage = "ja-JP";
speechConfig.speechRecognitionLanguage = "ja-JP";  // 设置为日语

const app = express();

app.use('/', express.static(path.join(__dirname, 'public')))

server = http.createServer(app).listen(3000, function () {
    console.log('Example app listening on port 3000')
})

const io = socketio(server);



io.on('connection', (socket) => {
    let sampleRate = 48000;
    let bufferAll = [];

    socket.on('start', (data) => {
        sampleRate = data.sampleRate;
        bufferAll = [];
        //console.log(`Sample Rate: ${sampleRate}`);
    });

    socket.on('play', (data, rtn) => {
        index = data.index;
        console.log(calculate("java","javaです"));
        createWav(index, rtn);
    });

    const createWav = (index, rtn) => {

        // 创建语音配置和语音合成器
        const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

        const audioFilePath = path.join(__dirname, `/public/${index}.wav`);
        // 设置语音合成的语言
        speechConfig.speechSynthesisLanguage = "ja-JP";
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        // 要转换为语音的文本
        const text = json[0].q;
        synthesizer.speakTextAsync(
            text,
            result => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {

                    console.log("Synthesis completed.");
                    rtn(111);
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails);
                }
                synthesizer.close();
            },
            error => {
                console.error(error);
                synthesizer.close();
            }
        );

    };


    socket.on('send_pcm', (data) => {
        const itr = data.values()
        const buf = new Array(data.length)
        for (var i = 0; i < buf.length; i++) {
            buf[i] = itr.next().value
        }
        bufferAll = bufferAll.concat(buf)
    })

    //Stop
    socket.on('stop', (data, ack) => {
        const f32array = toF32Array(bufferAll);
        exportWAV(f32array, sampleRate, ack);
    })
})



// Convert byte array to Float32Array
const toF32Array = (buf) => {
    const buffer = new ArrayBuffer(buf.length)
    const view = new Uint8Array(buffer)
    for (var i = 0; i < buf.length; i++) {
        view[i] = buf[i]
    }
    return new Float32Array(buffer)
}

// data: Float32Array
// sampleRate: number
const exportWAV = (data, sampleRate, ack) => {
    const audioData = {
        sampleRate: sampleRate,
        channelData: [data]
    }
    WavEncoder.encode(audioData).then((buffer) => {
        // saveFile(buffer);
        v2t(buffer, ack);
    });
}

const saveFile = (buffer) => {

    const filename = path.join(__dirname, `/${String(Date.now())}.wav`);
    fs.writeFile(filename, Buffer.from(buffer), (e) => {
        if (e) {
            console.log(e)
        } else {
            console.log(`Successfully saved ${filename}`);
        }
    });
};

const createStream = (buffer) => {

    // 创建 ArrayBuffer 的可读流
    const audioStream = new ArrayBufferReadable(buffer);

    // 创建一个 pushStream
    const pushStream = sdk.AudioInputStream.createPushStream();

    // 从 Readable Stream 中读取数据并将其推送到 pushStream
    audioStream.on('data', (chunk) => {
        pushStream.write(chunk);
    });

    audioStream.on('end', () => {
        pushStream.close();
    });
    return pushStream;

};

const v2t = (buffer, ack) => {

    // 创建音频配置
    const audioConfig = sdk.AudioConfig.fromStreamInput(createStream(buffer));

    // 创建语音识别器
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(result => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            ack({ info: result.text });
        } else {
            ack({ info: "fail" });
            console.log(result);
            console.error(`Fail: ${result.errorDetails}`);
        }
        recognizer.close();
    });
}

const getToNgram = (text, n) => {
    let ret = {};
    for (var m = 0; m < n; m++) {
      for (var i = 0; i < text.length - m; i++) {
        const c = text.substring(i, i + m + 1);
        ret[c] = ret[c] ? ret[c] + 1 : 1;
      }
    }
    return ret;
  };
  // valueが数値のobjectの数値の和を求める関数。
const getValuesSum = (object) => {
    return Object.values(object).reduce((prev, current) => prev + current, 0);
  };
  
  const calculate =  (a, b) => {
    const aGram = getToNgram(a);
    const bGram = getToNgram(b);
    const keyOfAGram = Object.keys(aGram);
    const keyOfBGram = Object.keys(bGram);
    // aGramとbGramに共通するN-gramのkeyの配列
    const abKey = keyOfAGram.filter((n) => keyOfBGram.includes(n));
  
    // aGramとbGramの内積(0と1の掛け算のため、小さいほうの値を足し算すれば終わる。)
    let dot = abKey.reduce(
      (prev, key) => prev + Math.min(aGram[key], bGram[key]),
      0
    );
  
    // 長さの積(平方根の積は積の平方根)
    const abLengthMul = Math.sqrt(getValuesSum(aGram) * getValuesSum(bGram));
    return dot / abLengthMul;
  };