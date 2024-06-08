const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const WavEncoder = require('wav-encoder')
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require("fs");

const subscriptionKey = "6f78e68a9ef543988c4866e30d46bbae";
const serviceRegion = "japaneast";


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
    })

    socket.on('send_pcm', (data) => {
        // data: { "1": 11, "2": 29, "3": 33, ... }
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
        const filename = path.join(__dirname, `/${String(Date.now())}.wav`);
        //Wavファイルに変換する,toTxt
        exportWAV(f32array, sampleRate, filename,ack);
        
        
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
// filename: string
const exportWAV = (data, sampleRate, filename,ack) => {
    const audioData = {
        sampleRate: sampleRate,
        channelData: [data]
    }
    WavEncoder.encode(audioData).then((buffer) => {
        fs.writeFile(filename, Buffer.from(buffer), (e) => {
            if (e) {
                console.log(e)
            } else {
                console.log(`Successfully saved ${filename}`);
                v2t(filename,ack);
            }
        })
    })
}


const v2t = (filename,ack)=>{
    // 要识别的音频文件路径
   // const audioFilePath = path.join(__dirname, "/222.wav");
   const audioFilePath =filename;
    // 检查文件是否存在
    if (!fs.existsSync(audioFilePath)) {
        console.error(`Audio file does not exist: ${audioFilePath}`);
        process.exit(1);
    }

    // 检查文件是否为空
    const audioFileStat = fs.statSync(audioFilePath);
    if (audioFileStat.size === 0) {
        console.error(`Audio file is empty: ${audioFilePath}`);
        process.exit(1);
    }

    // 创建语音配置
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    // 设置语音合成的语言
    speechConfig.speechSynthesisLanguage = "ja-JP";
    speechConfig.speechRecognitionLanguage = "ja-JP";  // 设置为日语
    // 创建音频配置
    const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audioFilePath));

    // 创建语音识别器
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(result => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            ack({ filename: result.text });
            // fs.unlink(audioFilePath, (err) => {
            //     if (err) throw err;
            //     console.log('path/file.txt was deleted');
            //   });
            console.log(`Recognized: ${result.text}`);
        } else {
            console.error(`Error recognizing speech: ${result.errorDetails}`);
        }
        recognizer.close();
    });
}